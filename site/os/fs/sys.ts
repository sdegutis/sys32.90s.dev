import { Folder, StringFile } from "./base.js";

export class SysDrive extends Folder {

  async init() {
    const paths = await fetch(import.meta.resolve('./data.json')).then<string[]>(r => r.json());

    for (const path of paths) {
      const content = await fetch(path).then(r => r.text());
      const fixedpath = path.slice('/os/data/'.length);
      const parts = fixedpath.split('/');

      let dir: Folder = this;
      while (parts.length > 1) {
        const name = parts.shift()!;
        let next = dir.getFolder(name);
        if (!next) {
          next = new Folder(name);
          dir.add(next);
        }
        dir = next;
      }

      const name = parts.shift()!;
      const file = new StringFile(name, content);
      dir.add(file);
    }
  }

}
