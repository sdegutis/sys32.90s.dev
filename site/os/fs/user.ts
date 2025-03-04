import { opendb } from "./db.js";
import type { Drive, DriveItem } from "./drive.js";

const db = await opendb<{ path: string, content?: string }>('idbfs', 'path');

export class UserDrive implements Drive {

  items = new Map<string, DriveItem>();

  async mount() {
    for (const { path, content } of await db.all()) {
      if (path.endsWith('/')) {
        this.items.set(path, { type: 'folder' });
      }
      else {
        this.items.set(path, { type: 'file', content: content! });
      }
    }
  }

  async putdir(path: string) {
    this.items.set(path, { type: 'folder' });
    db.set({ path });
  }

  async putfile(path: string, content: string) {
    this.items.set(path, { type: 'file', content });
    db.set({ path, content });
  }

  async rmdir(path: string) {
    for (const key of this.items.keys()) {
      if (key.startsWith(path)) {
        db.del(key);
        this.items.delete(key);
      }
    }
  }

  async rmfile(path: string) {
    db.del(path);
    this.items.delete(path);
  }

}
