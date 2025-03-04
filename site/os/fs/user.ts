import { opendb } from "./db.js";
import type { Drive, DriveItem } from "./interface.js";

const db = await opendb<{ path: string, content?: string }>('idbfs', 'path');

export class UserDrive implements Drive {

  items = new Map<string, DriveItem>();

  async init() {
    for (const { path, content } of await db.all()) {
      if (path.endsWith('/')) {
        this.items.set(path, { type: 'folder' });
      }
      else {
        console.log(path, content)
      }

      // addFile(path, content);
    }
  }

  async mkdir(path: string) {
    this.items.set(path, { type: 'folder' });
    db.set({ path });
  }

  // push(path: string, content: string): void {
  //   idbfs.set({ path, content });
  // }

  // override remove(child: string) {
  //   super.remove(child);
  //   // const files = await idbfs.all();
  // }

}
