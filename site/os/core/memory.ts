import { fs } from "../fs/fs.js";
import { Bitmap } from "./bitmap.js";
import { Cursor } from "./cursor.js";
import { Font } from "./font.js";

export const mem = {
  font: new Font(fs.get('sys/font1.font')!),
  pointer: Cursor.fromBitmap(Bitmap.fromString(fs.get('sys/pointer.bitmap')!)),
  menubuttonImage: Bitmap.fromString(fs.get('sys/menubutton.bitmap')!),
};
