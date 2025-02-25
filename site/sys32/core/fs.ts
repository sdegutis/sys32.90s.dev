export interface Folder {

  get(name: string): Promise<Folder | string | undefined>;
  put(name: string, content: string): Promise<void>;
  mkdir(name: string): Promise<void>;

}

class MemoryFolder implements Folder {

  #items: Record<string, Folder | string> = {};

  async get(name: string) {
    return this.#items[name];
  }

  async put(name: string, content: string) {
    this.#items[name] = content;
  }

  async mkdir(name: string) {
    this.#items[name] = new MemoryFolder();
  }

  constructor() {

    // type JsonFile = {
    //   path: string;
    //   content: string;
    // };

    // (fetch(import.meta.resolve('./files.json'))
    //   .then<JsonFile[]>(res => res.json())
    //   .then(json => {
    //     console.log(json[0].path)
    //     console.log(json[0].content)
    //   }));
  }

}

class LocalStorageFolder implements Folder {

  async get(name: string) {
    return undefined;
  }

  async put(name: string, content: string) {

  }

  async mkdir(name: string) {

  }

}

class IndexedDbFolder implements Folder {

  async get(name: string) {
    return undefined;
  }

  async put(name: string, content: string) {

  }

  async mkdir(name: string) {

  }

}

class UserFolder implements Folder {

  async get(name: string) {
    return undefined;
  }

  async put(name: string, content: string) {

  }

  async mkdir(name: string) {

  }

  handle!: FileSystemDirectoryHandle;

  async getDir() {
    const dir = await this.handle.getDirectoryHandle('');
    const f = await dir.getFileHandle('');

  }

}

export class FS {

  drives: Record<string, Folder> = {
    a: new MemoryFolder(),
    // b: new LocalStorageFolder(),
    // c: new IndexedDbFolder(),
  };

  constructor() {
    this.#remountUserDrives();
  }

  #remountUserDrives() {

  }

  async loadFile(path: string): Promise<string | null> {
    const file = await this.#getdir(path);
    if (!file) return null;

    const found = await file.folder.get(file.filename);
    if (found === undefined) return null;
    if (typeof found === 'string') return found;

    console.error(`Expected file named "${file.filename}" but got folder`);
    return null;
  }

  async saveFile(path: string, content: string) {
    const file = await this.#getdir(path);
    if (!file) return;

    file.folder.put(file.filename, content);
  }

  async #getdir(path: string) {
    const segments = path.split('/');

    const drive = segments.shift()!;
    let folder: Folder = this.drives[drive];

    while (segments.length > 1) {
      const nextName = segments.shift()!;
      const nextFolder = await folder.get(nextName);

      if (!nextFolder) {
        console.error(`No item in folder named "${nextName}"`);
        return null;
      }

      if (typeof nextFolder === 'string') {
        console.error(`Expected folder named "${nextName}" but got file`);
        return null;
      }

      folder = nextFolder;
    }

    return { folder, filename: segments.pop()! };
  }

}
