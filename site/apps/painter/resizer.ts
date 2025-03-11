import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { dragResize } from "../../os/util/selections.js"

type Moveable = {
  zoom: number
  resize(w: number, h: number): void
}

export class ResizerView<T extends View & Moveable> extends View {

  override background = 0x00000077
  override w = 4
  override h = 4

  previousSibling() {
    if (!this.parent) return null
    const i = this.parent.children.indexOf(this)
    if (i < 1) return null
    return this.parent.children[i - 1] as T
  }

  override layout() {
    const other = this.previousSibling()
    if (!other) return

    this.x = other.x + other.w
    this.y = other.y + other.h
  }

  override onMouseDown() {
    const other = this.previousSibling()
    if (!other) return

    const o = { w: other.w, h: other.h }
    const fn = dragResize(o)

    sys.trackMouse({
      move: () => {
        fn()
        const w = Math.floor(o.w / other.zoom)
        const h = Math.floor(o.h / other.zoom)
        other.resize(w, h)
      }
    })
  }

}
