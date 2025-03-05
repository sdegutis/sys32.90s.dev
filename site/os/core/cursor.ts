import { Bitmap } from "./bitmap.js";

export class Cursor {

  private bitmap: Bitmap;
  private ox;
  private oy;

  static fromBitmap(bitmap: Bitmap) {
    for (let i = 0; i < bitmap.pixels.length; i++) {
      const ci = bitmap.pixels[i];
      if (ci > 0) {
        const p = bitmap.colors[ci - 1];
        const a = p & 0xff;
        if (a === 0xfe) {
          let x = i % bitmap.width;
          let y = Math.floor(i / bitmap.width);
          return new Cursor(bitmap, x, y);
        }
      }
    }
    return new Cursor(bitmap, 0, 0);
  }

  constructor(bitmap: Bitmap, ox: number, oy: number) {
    this.bitmap = bitmap;
    this.ox = ox;
    this.oy = oy;
  }

  draw(x: number, y: number) {
    this.bitmap.draw(x - this.ox, y - this.oy);
  }

}
