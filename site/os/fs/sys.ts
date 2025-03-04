import { type Drive } from "./interface.js";

export class SysDrive implements Drive {

  items = new Map<string, { content: string }>();

  async init() {
    const paths = await fetch(import.meta.resolve('./data.json')).then<string[]>(r => r.json());

    for (const path of paths) {
      const content = await fetch(path).then(r => r.text());
      const fixedpath = path.slice('/os/data/'.length);
      this.items.set(fixedpath, { content });
    }
  }

}
