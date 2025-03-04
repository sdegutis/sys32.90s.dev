import { Folder, type Drive } from "./base.js";
import { opendb } from "./db.js";

const idbfs = await opendb<{ path: string, content?: string }>('idbfs', 'path');

export class UserDrive extends Folder implements Drive {

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
