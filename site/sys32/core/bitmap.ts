import { CRT } from "./crt.js";

export class Bitmap {

  width: number;
  height: number;
  pixels: number[];
  colors: number[];

  constructor(colors: number[], w: number, pixels: number[]) {
    this.pixels = pixels;
    this.colors = colors;
    this.width = w;
    this.height = this.pixels.length / w;
  }

  draw(crt: CRT, px: number, py: number) {
    let i = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const s = this.pixels[i++];
        if (s) crt.pset(px + x, py + y, this.colors[s - 1]);
      }
    }
  }

}
