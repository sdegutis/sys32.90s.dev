import { crt } from "../core/crt.js"
import { View } from "../core/view.js"

export class Border extends View {

  u = 0
  d = 0
  l = 0
  r = 0
  set padding(n: number) { this.u = this.d = this.l = this.r = n }

  borderColor = 0x00000000

  override passthrough = true

  override adjust(): void {
    this.w = this.l + (this.firstChild?.w ?? 0) + this.r
    this.h = this.u + (this.firstChild?.h ?? 0) + this.d
  }

  override layout(): void {
    const c = this.firstChild
    if (c) {
      c.x = this.l
      c.y = this.u
    }
  }

  override draw(): void {
    super.draw()
    if ((this.borderColor & 0x000000ff) > 0) {
      crt.rectFill(0, 0, this.w, this.u, this.borderColor)
      crt.rectFill(0, this.h - this.d, this.w, this.d, this.borderColor)
      crt.rectFill(0, this.u, this.l, this.h - this.u - this.d, this.borderColor)
      crt.rectFill(this.w - this.r, this.u, this.r, this.h - this.u - this.d, this.borderColor)
    }
  }

}
