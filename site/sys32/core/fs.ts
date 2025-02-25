export interface Folder {

  getFile(name: string): Promise<string | undefined>;
  getFolder(name: string): Promise<Folder | undefined>;
  putFile(name: string, content: string): Promise<void>;
  makeFolder(name: string): Promise<Folder>;

}

class MemoryFolder implements Folder {

  #items: Record<string, Folder | string> = {};

  async getFile(name: string) {
    const f = this.#items[name];
    if (typeof f !== 'string') {
      throw new Error(`Expected file got folder [${name}]`);
    }
    return f;
  }

  async getFolder(name: string) {
    const f = this.#items[name];
    if (typeof f === 'string') {
      console.log(name)
      throw new Error(`Expected folder got file [${name}]`);
    }
    return f;
  }

  async putFile(name: string, content: string) {
    this.#items[name] = content;
  }

  async makeFolder(name: string) {
    const f = new MemoryFolder();
    this.#items[name] = f;
    return f;
  }

}

// class LocalStorageFolder implements Folder {



//   async getFile(name: string) {
//     return undefined;
//   }

//   async getFolder(name: string) {
//     return undefined;
//   }

//   async putFile(name: string, content: string) {

//   }

//   async mkdir(name: string) {

//   }

// }

// class IndexedDbFolder implements Folder {

//   async getFile(name: string) {
//     return undefined;
//   }

//   async getFolder(name: string) {
//     return undefined;
//   }

//   async putFile(name: string, content: string) {

//   }

//   async mkdir(name: string) {

//   }

// }

class UserFolder implements Folder {

  #dir: FileSystemDirectoryHandle;

  constructor(dir: FileSystemDirectoryHandle) {
    this.#dir = dir;
  }

  async getFile(name: string) {
    const h = await this.#dir.getFileHandle(name);
    const f = await h.getFile();
    return await f.text();
  }

  async getFolder(name: string) {
    const h = await this.#dir.getDirectoryHandle(name);
    return new UserFolder(h);
  }

  async putFile(name: string, content: string) {
    const h = await this.#dir.getFileHandle(name);
    const w = await h.createWritable();
    await w.write(content);
    await w.close();
  }

  async makeFolder(name: string) {
    const h = await this.#dir.getDirectoryHandle(name, { create: true });
    return new UserFolder(h);
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

  async #remountUserDrives() {
    const db = await opendb();
    const drives = await getdrives(db);
    for (const { drive, folder } of drives) {
      this.drives[drive] = new UserFolder(folder);
    }
  }

  async loadFile(path: string): Promise<string | null> {
    const file = await this.#getdir(path);
    if (!file) return null;

    const found = await file.folder.getFile(file.filename);
    return found ?? null;
  }

  async saveFile(path: string, content: string) {
    const file = await this.#getdir(path);
    if (!file) return;

    file.folder.putFile(file.filename, content);
  }

  async #getdir(path: string) {
    const segments = path.split('/');

    const drive = segments.shift()!;
    let folder: Folder = this.drives[drive];

    while (segments.length > 1) {
      const nextName = segments.shift()!;
      const nextFolder = await folder.getFolder(nextName);

      if (!nextFolder) {
        console.error(`No item in folder named "${nextName}"`);
        return null;
      }

      folder = nextFolder;
    }

    return { folder, filename: segments.pop()! };
  }

}

function opendb() {
  return new Promise<IDBDatabase>(res => {
    const dbopenreq = window.indexedDB.open('fs', 1);
    dbopenreq.onerror = console.log;
    dbopenreq.onupgradeneeded = () => {
      const db = dbopenreq.result;
      db.createObjectStore('mounts', { keyPath: 'drive' });
    };
    dbopenreq.onsuccess = e => {
      const db = dbopenreq.result;
      res(db);
    };
  });
}

function getdrives(db: IDBDatabase) {
  return new Promise<{ drive: string, folder: FileSystemDirectoryHandle }[]>(res => {
    const t = db.transaction('mounts', 'readonly');
    const store = t.objectStore('mounts');
    const all = store.getAll();
    all.onerror = console.log;
    all.onsuccess = (e) => res(all.result);
  });
}
