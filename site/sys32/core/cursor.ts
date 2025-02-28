import { Bitmap } from "./bitmap.js";

export class Cursor {
  bitmap: Bitmap;
  offset: [number, number];

  constructor(
    bitmap: Bitmap,
    offset: [number, number]
  ) {
    this.bitmap = bitmap;
    this.offset = offset;
  }
}

export const emptyCursor = new Cursor(new Bitmap([], 0, []), [0, 0]);
