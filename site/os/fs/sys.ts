import { type Drive, type DriveItem } from "./interface.js";

export class SysDrive implements Drive {

  items = new Map<string, DriveItem>();

  async init() {
    const paths = await fetch(import.meta.resolve('./data.json')).then<string[]>(r => r.json());

    for (const path of paths) {
      const content = await fetch(path).then(r => r.text());
      const fixedpath = path.slice('/os/data/'.length);
      this.items.set(fixedpath, { type: 'file', content });

      const dirs = fixedpath.split('/').slice(0, -1);
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs.slice(0, i + 1).join('/') + '/';
        this.items.set(dir, { type: 'folder' });
      }
    }
  }

}
