import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { dragResize } from "../../os/util/selections.js"

export class ResizerView<T extends View & { zoom: number; resize(w: number, h: number): void }> extends View {

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
    const paintView = this.previousSibling()!
    this.x = paintView.w
    this.y = paintView.h
  }

  override onMouseDown() {
    const paintView = this.previousSibling()!
    const o = { w: paintView.w, h: paintView.h }
    const fn = dragResize(o)

    sys.trackMouse({
      move: () => {
        fn()
        const w = Math.floor(o.w / paintView.zoom)
        const h = Math.floor(o.h / paintView.zoom)
        paintView.resize(w, h)
      }
    })
  }

}
