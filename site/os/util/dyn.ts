import { Listener, Reactive } from "./events.js"

export class Dynamic {

  init?(): void

  $data<K extends keyof this, R extends Reactive<this[K]>>(k: K, v?: R): R {
    const $$data: { [K in keyof this]: Reactive<this[K]> } = (this as any).$$data
    if (v) $$data[k] = v
    return $$data[k] as R
  }

  $watch<K extends keyof this>(key: K, fn: (val: this[K]) => void) {
    this.$data(key).watch(fn)
  }

}

type No$Reactive = Array<any> | Function | Listener | Reactive<any> | undefined
type $Reactives<T> = { [K in keyof T as T[K] extends No$Reactive ? never : `$${K & string}`]: Reactive<T[K]> }
type DontForgetConfig = { YouForgotConfig: never }
type PartialExceptMethodThis<T> = { [K in keyof T]?: T[K] extends (undefined | ((...args: infer A) => infer R)) ? (this: T, ...args: A) => R : T[K] }


export function $<T extends Dynamic>(
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
  while (proto = Object.getPrototypeOf(proto)) protos.push(proto)
  while (proto = protos.pop()) proto.init?.call(view)
  return view
}

function makeDynamic<T extends Dynamic>(o: T) {
  const $$data: Record<string, Reactive<any>> = Object.create(null)

  for (let [key, val] of Object.entries(o)) {
    if (val instanceof Function) continue
    if (val instanceof Reactive) continue
    if (val instanceof Listener) continue
    if (val instanceof Array) continue
    if (Object.getOwnPropertyDescriptor(o, key)?.get) continue
    if (!key.startsWith('$')) {
      $$data[key] = new Reactive(val)
      Object.defineProperty(o, key, {
        get: () => $$data[key].data,
        set: (v) => $$data[key].update(v),
        enumerable: true,
      })
    }
  }

  for (let [key, r] of Object.entries(o)) {
    if (key === '$$data') continue
    if (key.startsWith('$')) {
      $$data[key.slice(1)] = r
    }
  }

  Object.defineProperty(o, '$$data', { enumerable: false, writable: false, value: $$data })
}
