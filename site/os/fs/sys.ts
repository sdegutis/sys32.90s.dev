import { Folder, StringFile } from "./interface.js";

class SysFolder extends Folder {

  override async makeFolder(name: string) {
    return new SysFolder(name);
  }

  override async makeFile(name: string, content: string) {
    return new SysFile(name, content);
  }

}

class SysFile extends StringFile {

}

export class SysDrive extends SysFolder {

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
          next = new SysFolder(name);
          dir.add(next);
        }
        dir = next;
      }

      const name = parts.shift()!;
      const file = new SysFile(name, content);
      dir.add(file);
    }
  }

}
