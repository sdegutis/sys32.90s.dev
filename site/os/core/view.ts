import { fs } from "../fs/fs.js"
import { Listener, Reactive } from "../util/events.js"
import { Bitmap } from "./bitmap.js"
import { crt } from "./crt.js"
import { Cursor } from "./cursor.js"

const pointer = Cursor.fromBitmap(Bitmap.fromString(fs.get('sys/pointer.bitmap')!))

export class View {

  init?(): void
  onScroll?(up: boolean): void
  onKeyDown?(key: string): boolean
  onMouseDown?(button: number): void
  onMouseEntered?(): void
  onMouseExited?(): void
  onFocus?(): void
  onBlur?(): void
  layout?(): void
  adjust?(): void
  adopted?(): void
  abandoned?(): void

  onBaseFocus?(): void
  onBaseBlur?(): void

  id = ''

  x = 0
  y = 0
  w = 0
  h = 0
  background = 0x00000000
  passthrough = false
  visible = true
  focused = false
  hovered = false

  canBaseFocus = false

  private _children: View[] = []
  get children(): ReadonlyArray<View> { return this._children }
  get firstChild(): View | undefined { return this.children[0] }
  get lastChild(): View | undefined { return this.children[this.children.length - 1] }

  mouse = { x: 0, y: 0 }
  cursor: Cursor | null = pointer

  parent?: View

  set children(children: View[]) {
    for (const child of this._children) {
      if (child.parent === this) {
        child.parent = undefined!
        child.abandoned?.()
      }
    }
    this._children = children
    for (const child of children) {
      child.parent = this
      child.adopted?.()
    }
  }

  addChild(child: View, pos?: number) {
    child.parent?.removeChild(child)
    const i = pos ?? this._children.length
    this._children.splice(i, 0, child)
    child.parent = this
    child.adopted?.()
  }

  removeChild(child: View) {
    const i = this._children.indexOf(child)
    if (i === -1) return
    this._children.splice(i, 1)
    child.parent = undefined!
    child.abandoned?.()
  }

  draw() {
    if ((this.background & 0x000000ff) > 0) {
      crt.rectFill(0, 0, this.w, this.h, this.background)
    }
  }

  remove() {
    this.parent?.removeChild(this)
  }

  find<T extends View>(id: string): T | null {
    if (this.id === id) return this as unknown as T
    for (const child of this._children) {
      const found = child.find<T>(id)
      if (found) return found
    }
    return null
  }

  $data<K extends keyof this, R extends Reactive<this[K]>>(k: K, v?: R): R {
    const $$data: { [K in keyof this]: Reactive<this[K]> } = (this as any).$$data
    if (v) $$data[k] = v
    return $$data[k] as R
  }

  $watch<K extends keyof this>(key: K, fn: (val: this[K]) => void) {
    this.$data(key).watch(fn)
  }

  _YouForgotConfig_: undefined

}

type No$Reactive = Array<any> | Function | Listener | undefined
type $Reactives<T> = { [K in keyof T as T[K] extends No$Reactive ? never : `$${K & string}`]: Reactive<T[K]> }
type DontForgetConfig = { YouForgotConfig: never }
// type UnpartialThis<T> = { [K in keyof T]?: T[K] extends (...args: infer A) => infer R ? (this: T, ...args: A) => R : T[K] }

export function $<T extends View>(
  ctor: { new(): T },
  config: Partial<T & DontForgetConfig & $Reactives<T>>,
  ...children: View[]
): T {
  const view = new ctor()
  view.children = children
  Object.assign(view, config)
  makeDynamic(view)
  const protos = []
  let proto: T | undefined = view
  while (proto = Object.getPrototypeOf(proto)) protos.push(proto)
  while (proto = protos.pop()) proto.init?.call(view)
  return view
}

function makeDynamic<T extends View>(o: T) {
  const $$data: Record<string, Reactive<any>> = Object.create(null)

  for (let [key, val] of Object.entries(o)) {
    if (val instanceof Function) continue
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
