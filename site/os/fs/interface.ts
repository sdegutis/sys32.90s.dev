// import type { Navable } from "./fs.js";

// export abstract class StringFile {

//   name: string;
//   #content!: string;

//   constructor(name: string, content: string) {
//     this.name = name;
//     this.content = content;
//   }

//   get content() { return this.#content }
//   set content(s: string) { this.#content = this.#normalize(s) }

//   #normalize(content: string): string { return content.replace(/\r\n/g, '\n'); }

//   push() { }

// }

// export abstract class Folder {

//   name: string;
//   items: (Folder | StringFile)[] = [];

//   constructor(name: string) {
//     this.name = name;
//   }

//   get files() { return this.items.filter(it => it instanceof StringFile); }
//   get folders() { return this.items.filter(it => it instanceof Folder); }

//   getFile(name: string) { return this.files.find(f => f.name === name); }
//   getFolder(name: string) { return this.folders.find(f => f.name === name); }

//   add(item: StringFile | Folder) {
//     this.items.push(item);
//     this.items.sort(sortBy(f => (f instanceof Folder ? 0 : 1) + f.name));
//   }

//   del(child: string) {
//     const i = this.items.findIndex(f => f.name === child);
//     this.items.splice(i, 1);
//   }

//   findDir(parts: string[]) {
//     let current: Folder = this;
//     while (parts.length > 0) {
//       const part = parts.shift()!;
//       let found = current.getFolder(part);
//       if (!found) {
//         throw new Error(`Folder not found: [${parts.join('/')}]`);
//       }
//       current = found;
//     }
//     return current;
//   }

//   abstract makeFolder(name: string): Promise<Folder>;
//   abstract makeFile(name: string, content: string): Promise<StringFile>;

//   async getOrCreateFile(name: string, content: string) {
//     let file = this.getFile(name);
//     if (!file) {
//       file = await this.makeFile(name, content);
//       this.add(file);
//     }
//     else {
//       file.content = content;
//     }
//     file.push();
//     return file;
//   }

//   async getOrCreateFolder(name: string) {
//     let dir = this.getFolder(name);
//     if (!dir) {
//       dir = await this.makeFolder(name);
//       this.add(dir);
//     }
//     return dir;
//   }

// }

export interface Drive {

  items: Map<string, { content: string }>;

  init(): Promise<void>;
  deinit?(): void;

}

// function sortBy<T, U>(fn: (o: T) => U) {
//   return (a: T, b: T) => {
//     const aa = fn(a);
//     const bb = fn(b);
//     if (aa < bb) return -1;
//     if (aa > bb) return +1;
//     return 0;
//   };
// }
