import { crt } from "../core/crt.js"
import { View } from "../core/view.js"

export function makeStripeDrawer(w = 4, h = 3) {
  return function (this: View) {
    View.prototype.draw.call(this)
    let off = 0
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x += w) {
        crt.pset(off + x, y, 0xffffff04)
      }
      if (y % h === (h - 1)) off = (off + 1) % w
    }
  }
}
