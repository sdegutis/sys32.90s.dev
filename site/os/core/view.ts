import { fs } from "../fs/fs.js"
import { Addressable } from "../util/dyn.js"
import { Bitmap } from "./bitmap.js"
import { crt } from "./crt.js"
import { Cursor } from "./cursor.js"
import type { System } from "./system.js"

const pointer = Cursor.fromBitmap(Bitmap.fromString(fs.get('sys/pointer.bitmap')!))

export class View extends Addressable {

  onScroll?(up: boolean): void
  onKeyDown?(key: string): boolean
  onMouseDown?(button: number): void
  onMouseEntered?(): void
  onMouseExited?(): void
  onFocus?(): void
  onBlur?(): void
  layout?(): void
  adjust?(): void

  onBaseFocus?(): void
  onBaseBlur?(): void

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

  mouse = { x: 0, y: 0 }
  cursor: Cursor | null = pointer

  parent: View | undefined = undefined
  children: ReadonlyArray<View> = []

  override init(): void {
    this.$watch('children', (children, old) => {
      for (const child of old) {
        if (child.parent === this) {
          child.parent = undefined
        }
      }
      for (const child of children) {
        child.parent = this
      }
      this.onChildResized()
      this.needsRedraw()
    })

    this.$watch('w', (w, old) => { if (w !== old) this.onResized() })
    this.$watch('h', (h, old) => { if (h !== old) this.onResized() })
  }

  onResized() {
    this.parent?.onChildResized?.()
    this.needsRedraw()
  }

  layoutTree() {
    this.layout?.()
    for (const child of this.children) {
      child.layoutTree()
    }
    this.needsRedraw()
  }

  onChildResized() {
    this.adjust?.()
  }

  needsRedraw() {
    if (!sys) return
    sys.needsRedraw = true
  }

  moveChild(child: View, pos = this.children.length) {
    const i = this.children.indexOf(child)
    if (i === -1) return
    this.children = this.children.toSpliced(i, 1).toSpliced(pos, 0, child)
  }

  addChild(child: View, pos = this.children.length) {
    child.parent?.removeChild(child)
    this.children = this.children.toSpliced(pos, 0, child)
    child.parent = this
  }

  removeChild(child: View) {
    const i = this.children.indexOf(child)
    if (i === -1) return
    this.children = this.children.toSpliced(i, 1)
    child.parent = undefined
  }

  get firstChild(): View | undefined { return this.children[0] }
  get lastChild(): View | undefined { return this.children[this.children.length - 1] }

  draw() {
    if ((this.background & 0x000000ff) > 0) {
      crt.rectFill(0, 0, this.w, this.h, this.background)
    }
  }

  remove() {
    this.parent?.removeChild(this)
  }

}

let sys: System
import('./system.js').then(mod => sys = mod.sys)
