import { System } from "./system.js";

export class Bitmap {

  w: number;
  h: number;
  pixels: number[];
  colors: number[];

  constructor(colors: number[], w: number, pixels: number[]) {
    this.pixels = pixels;
    this.colors = colors;
    this.w = w;
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
