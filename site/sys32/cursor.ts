import { Bitmap } from "./bitmap.js";

export interface Cursor {
  bitmap: Bitmap,
  offset: [number, number],
}
