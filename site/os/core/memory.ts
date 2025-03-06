import { fs } from "../fs/fs.js";
import { Reactive } from "../util/events.js";
import { Bitmap } from "./bitmap.js";
import { Cursor } from "./cursor.js";
import { makeDynamic } from "./dyn.js";
import { Font } from "./font.js";
import { sys } from "./system.js";

function livefile<T>(path: string, to: (content: string) => T) {
  const s = fs.get(path)!;
  const r = new Reactive<T>(to(s));
  fs.watchTree(path, (type) => {
    if (type === 'disappeared') return;
    const s = fs.get(path)!;
    r.update(to(s));
    sys.needsRedraw = true;
    sys.layoutTree();
  });
  return r;
}

export const mem = makeDynamic({
  $font: livefile('sys/font1.font', s => new Font(s)),
  $pointer: livefile('sys/pointer.bitmap', s => Cursor.fromBitmap(Bitmap.fromString(s))),
  $menubuttonImage: livefile('sys/menubutton.bitmap', s => Bitmap.fromString(s)),
});
