import { Bitmap } from "./bitmap.js";

export class Cursor {
  bitmap: Bitmap;
  offset: [number, number];

  static fromBitmap(bitmap: Bitmap) {
    for (let i = 0; i < bitmap.pixels.length; i++) {
      const ci = bitmap.pixels[i];
      if (ci > 0) {
        const p = bitmap.colors[ci - 1];
        const a = p & 0xff;
        if (a === 0xfe) {
          let x = i % bitmap.width;
          let y = Math.floor(i / bitmap.width);
          return new Cursor(bitmap, [x, y]);
        }
      }
    }
    return new Cursor(bitmap, [0, 0]);
  }

  constructor(bitmap: Bitmap, offset: [number, number]) {
    this.bitmap = bitmap;
    this.offset = offset;
  }
}

export const emptyCursor = Cursor.fromBitmap(new Bitmap([], 0, []));
