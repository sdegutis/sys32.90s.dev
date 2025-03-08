import { fs } from "../fs/fs.js"
import { Bitmap } from "./bitmap.js"
import { crt } from "./crt.js"
import { Cursor } from "./cursor.js"
import { Dynamic } from "./dyn.js"

const pointer = Cursor.fromBitmap(Bitmap.fromString(fs.get('sys/pointer.bitmap')!))

export class View extends Dynamic {

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

}
