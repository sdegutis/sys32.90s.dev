import { Listener, Reactive } from "./events.js"

export class Addressable {

  init?(): void

  $ref<K extends keyof this, R extends Reactive<this[K]>>(k: K, v?: R): R {
    const $$refs: { [K in keyof this]: Reactive<this[K]> } = (this as any).$$refs
    if (v) $$refs[k] = v
    return $$refs[k] as R
  }

  $watch<K extends keyof this>(key: K, fn: (val: this[K], old: this[K]) => void) {
    return this.$ref(key).watch(fn)
  }

}

type No$Reactive = Function | Listener | Reactive<any> | undefined
type $Reactives<T> = { [K in keyof T as T[K] extends No$Reactive ? never : `$${K & string}`]: Reactive<T[K]> }
type DontForgetConfig = { YouForgotConfig: never }
type PartialExceptMethodThis<T> = { [K in keyof T]?: T[K] extends (undefined | ((...args: infer A) => infer R)) ? (this: T, ...args: A) => R : T[K] }

export function $<T extends Addressable>(
  ctor: { new(): T },
  config?: PartialExceptMethodThis<T & DontForgetConfig & $Reactives<T>>,
  ...children: T extends { children?: ArrayLike<infer C> } ? C[] : never[]
): T {
  const view = new ctor()
  if ('children' in view) view.children = children
  Object.assign(view, config)
  makeDynamic(view)
  const protos = []
  let proto: T | undefined = view
  while (proto = Object.getPrototypeOf(proto)) if (Object.hasOwn(proto, 'init')) protos.push(proto)
  while (proto = protos.pop()) proto.init!.call(view)
  return view
}

function makeDynamic<T extends Addressable>(o: T) {
  const $$refs: Record<string, Reactive<any>> = Object.create(null)

  for (let [key, val] of Object.entries(o)) {
    if (val instanceof Function) continue
    if (val instanceof Reactive) continue
    if (val instanceof Listener) continue
    if (Object.getOwnPropertyDescriptor(o, key)?.get) continue
    if (!key.startsWith('$')) {
      $$refs[key] = new Reactive(val)
      Object.defineProperty(o, key, {
        get: () => $$refs[key].data,
        set: (v) => $$refs[key].update(v),
        enumerable: true,
      })
    }
  }

  for (let [key, r] of Object.entries(o)) {
    if (key === '$$refs') continue
    if (key.startsWith('$')) {
      $$refs[key.slice(1)] = r
    }
  }

  Object.defineProperty(o, '$$refs', { enumerable: false, writable: false, value: $$refs })
}
