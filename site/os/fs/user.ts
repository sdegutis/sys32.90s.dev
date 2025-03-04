import { opendb } from "./db.js";
import type { Drive, DriveItem, DriveNotificationType } from "./drive.js";

const db = await opendb<{ path: string, content?: string }>('idbfs', 'path');

export class UserDrive implements Drive {

  items = new Map<string, DriveItem>();
  notify?: (type: DriveNotificationType, path: string) => void;

  async mount(notify: (type: DriveNotificationType, path: string) => void) {
    this.notify = notify;

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
    if (this.items.has(path)) return;

    this.items.set(path, { type: 'folder' });
    db.set({ path });
    this.notify?.('modified', path);
  }

  async putfile(path: string, content: string) {
    const has = this.items.has(path);
    this.items.set(path, { type: 'file', content });
    db.set({ path, content });
    this.notify?.(has ? 'modified' : 'appeared', path);
  }

  async rmdir(path: string) {
    for (const key of this.items.keys()) {
      if (key.startsWith(path)) {
        db.del(key);
        this.items.delete(key);
      }
    }
    this.notify?.('disappeared', path);
  }

  async rmfile(path: string) {
    db.del(path);
    this.items.delete(path);
    this.notify?.('disappeared', path);
  }

}
