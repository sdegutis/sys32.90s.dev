import { crt } from "../core/crt.js"
import { View } from "../core/view.js"

export class Border extends View {

  padding = 0
  borderColor = 0x00000000

  override passthrough = true

  override adjust(): void {
    this.w = this.padding + (this.firstChild?.w ?? 0) + this.padding
    this.h = this.padding + (this.firstChild?.h ?? 0) + this.padding
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.x = this.padding
      c.y = this.padding
    }
  }

  override draw(): void {
    super.draw()
    if ((this.borderColor & 0x000000ff) > 0) {
      const p = this.padding
      crt.rectFill(0, 0, this.w, p, this.borderColor)
      crt.rectFill(0, this.h - p, this.w, p, this.borderColor)
      crt.rectFill(0, p, p, this.h - p - p, this.borderColor)
      crt.rectFill(this.w - p, p, p, this.h - p - p, this.borderColor)
    }
  }

}
