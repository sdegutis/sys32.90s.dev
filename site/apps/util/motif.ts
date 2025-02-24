import { System } from "../../sys32/core/system.js";
import { View } from "../../sys32/core/view.js";

export function makeMotifDraw(sys: System, w = 4, h = 3) {
  return function (this: View) {
    let off = 0;
    for (let y = 0; y < this.h!; y++) {
      for (let x = 0; x < this.w!; x += w) {
        sys.crt.pset(off + x, y, 0x272727ff);
      }
      if (y % h === (h - 1)) off = (off + 1) % w;
    }
  }
}
