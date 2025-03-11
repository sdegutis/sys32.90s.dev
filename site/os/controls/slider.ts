import { crt } from "../core/crt.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { dragMove } from "../util/selections.js"

/** @deprecated */
export class Slider extends View {

  onChange?(): void

  min = 1
  max = 10
  val = 5

  knobSize = 2
  lineSize = 1

  override adjust(): void {
    this.h = this.knobSize
  }

  override onMouseDown(): void {
    const o = { x: this.mouse.x, y: 0 }
    const fn = dragMove(o)

    sys.trackMouse({
      move: () => {
        const oldval = this.val

        fn()
        o.x = Math.max(0, Math.min(this.w, o.x))
        const p = o.x / this.w
        this.val = Math.round((this.max - this.min) * p + this.min)

        if (this.val !== oldval) {
          this.onChange?.()
        }
      }
    })

  }

  override draw(): void {
    super.draw()
    const y1 = Math.floor(this.h / 2)
    crt.rectFill(0, y1, this.w, 1, 0xffffff33)
    const p = (this.val - this.min) / (this.max - this.min)
    const x = Math.floor(p * (this.w - this.knobSize))
    const y = Math.round(this.h / 2 - this.knobSize / 2)
    crt.rectFill(x, y, this.knobSize, this.knobSize, 0xffffffff)
  }

}
