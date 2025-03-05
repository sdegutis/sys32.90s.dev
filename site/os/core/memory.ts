import { fs } from "../fs/fs.js";
import { Reactive } from "../util/events.js";
import { Bitmap } from "./bitmap.js";
import { Cursor } from "./cursor.js";
import { Font } from "./font.js";
import { sys } from "./system.js";
import { Dynamic } from "./view.js";

class Memory extends Dynamic {

  font: Font = null!;
  pointer: Cursor = null!;

  init() {
    this.font = new Font(fs.get('sys/font1.font')!);
    this.pointer = Cursor.fromBitmap(Bitmap.fromString(fs.get('sys/pointer.bitmap')!));
  }

}

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

export const mem = new Memory();
