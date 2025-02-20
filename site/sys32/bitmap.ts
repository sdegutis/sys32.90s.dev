import { System } from "./system.js";

export class Bitmap {

  h: number;
  constructor(public colors: number[], public w: number, public pixels: number[]) {
    this.h = this.pixels.length / w;
  }

  draw(sys: System, px: number, py: number) {
    let i = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const s = this.pixels[i++];
        if (s) sys.pset(px + x, py + y, this.colors[s - 1]);
      }
    }
  }

}
