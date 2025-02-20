import { Bitmap } from "./bitmap.js";

export interface Cursor {
  image: Bitmap,
  hotspot: [number, number],
}
