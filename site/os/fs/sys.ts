import { type Drive, type DriveItem } from "./drive.js";

export class SysDrive implements Drive {

  items = new Map<string, DriveItem>();

  async mount() {

    const path1 = import.meta.resolve('./data.json');
    const paths = await fetch(path1).then<string[]>(r => r.json());

    console.log(path1)

    for (const path of paths) {
      console.log(path)
      const content = await fetch(path).then(r => r.text());
      const fixedpath = path.slice('/os/data/'.length);
      this.items.set(fixedpath, { type: 'file', content });

      const dirs = fixedpath.split('/').slice(0, -1);
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs.slice(0, i + 1).join('/') + '/';
        this.putdir(dir);
      }
    }
  }

  async putdir(path: string) {
    this.items.set(path, { type: 'folder' });
  }

  async putfile(path: string, content: string) {
    this.items.set(path, { type: 'file', content });
  }

  async rmdir(path: string) {
    for (const key of this.items.keys()) {
      if (key.startsWith(path)) {
        this.items.delete(key);
      }
    }
  }

  async rmfile(path: string) {
    this.items.delete(path);
  }

}
