import { opendb } from "./db.js";
import type { Drive, DriveItem } from "./interface.js";

const idbfs = await opendb<{ path: string, content?: string }>('idbfs', 'path');

export class UserDrive implements Drive {

  items = new Map<string, DriveItem>();

  async init() {
    for (const { path, content } of await idbfs.all()) {
      // addFile(path, content);
    }
  }

  // push(path: string, content: string): void {
  //   idbfs.set({ path, content });
  // }

  // override remove(child: string) {
  //   super.remove(child);
  //   // const files = await idbfs.all();
  // }

}
