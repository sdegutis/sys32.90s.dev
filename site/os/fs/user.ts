// import { Folder, StringFile, type Drive } from "./interface.js";
// import { opendb } from "./db.js";

import { opendb } from "./db.js";
import type { Drive } from "./interface.js";

const idbfs = await opendb<{ path: string, content?: string }>('idbfs', 'path');

// class UserFolder extends Folder {

//   override async makeFolder(name: string) {
//     return new UserFolder(name);
//   }

//   override async makeFile(name: string, content: string) {
//     return new UserFile(name, content);
//   }

// }

// class UserFile extends StringFile {

// }

export class UserDrive implements Drive {

  items = new Map<string, { content: string; }>();

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
