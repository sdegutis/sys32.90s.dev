export interface Folder {

  getFile(name: string): Promise<string | undefined>;
  getFolder(name: string): Promise<Folder | undefined>;

  putFile(name: string, content: string): Promise<void>;
  putFolder(name: string): Promise<Folder>;

  list(): Promise<{ kind: 'file' | 'folder', name: string }[]>;

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
      throw new Error(`Expected folder got file [${name}]`);
    }
    return f;
  }

  async putFile(name: string, content: string) {
    this.#items[name] = content;
  }

  async putFolder(name: string) {
    const f = new MemoryFolder();
    this.#items[name] = f;
    return f;
  }

  async list() {
    return Object.keys(this.#items).map(name => {
      const kind: 'file' | 'folder' = typeof name === 'string' ? 'file' : 'folder';
      return { name, kind };
    });
  }

}

class IndexedDbFolder implements Folder {

  #prefix: string;

  constructor(prefix: string) {
    this.#prefix = prefix;
  }

  async getFile(name: string) {
    const db = await shareddb;
    const item = await new Promise<{
      name: string,
      path: string,
      prefix: string,
      content?: string,
    }>(res => {
      const t = db.transaction('files', 'readwrite');
      const store = t.objectStore('files');
      const r = store.get(this.#prefix + name);
      r.onerror = console.log;
      r.onsuccess = (e: any) => res(e.target.result);
    });
    return item.content;
  }

  async getFolder(name: string) {
    const db = await shareddb;
    const result = await new Promise<{
      name: string,
      path: string,
      prefix: string,
      content?: string,
    }>(res => {
      const t = db.transaction('files', 'readwrite');
      const store = t.objectStore('files');
      const r = store.get(this.#prefix + name);
      r.onerror = console.log;
      r.onsuccess = (e: any) => res(e.target.result);
    });

    if (result) {
      return new IndexedDbFolder(this.#prefix + name + '/');
    }
    else {
      return undefined;
    }



    // const db = await shareddb;
    // const list = await new Promise<{
    //   name: string,
    //   path: string,
    //   prefix: string,
    //   content?: string,
    // }>(res => {
    //   const t = db.transaction('files', 'readwrite');
    //   const store = t.objectStore('files');
    //   const r = store.get(this.#prefix + name);
    //   r.onerror = console.log;
    //   r.onsuccess = (e: any) => res(e.target.result);
    // });
    // return list.map(it => ({
    //   name: it.name,
    //   kind: it.content === undefined ? 'folder' : 'file',
    // }));

    // return undefined;
  }

  async putFile(name: string, content: string) {
    const db = await shareddb;
    const t = db.transaction('files', 'readwrite');
    const store = t.objectStore('files');

    const r = store.put({
      name,
      prefix: this.#prefix,
      path: this.#prefix + name,
      content,
    });

    const p = Promise.withResolvers<void>();
    r.onerror = console.log;
    r.onsuccess = res => p.resolve();
    return p.promise;
  }

  async putFolder(name: string) {
    const db = await shareddb;
    const t = db.transaction('files', 'readwrite');
    const store = t.objectStore('files');

    const r = store.put({
      name,
      prefix: this.#prefix,
      path: this.#prefix + name,
    });

    const p = Promise.withResolvers<IndexedDbFolder>();
    r.onerror = console.log;
    r.onsuccess = res => p.resolve(new IndexedDbFolder(this.#prefix + name + '/'));
    return p.promise;
  }

  async list(): Promise<{ kind: "file" | "folder"; name: string; }[]> {
    const db = await shareddb;
    const list = await new Promise<{
      name: string,
      path: string,
      prefix: string,
      content?: string,
    }[]>(res => {
      const t = db.transaction('files', 'readwrite');
      const store = t.objectStore('files');
      const index = store.index('indexprefix');
      const r = index.getAll(this.#prefix);
      r.onerror = console.log;
      r.onsuccess = (e: any) => res(e.target.result);
    });
    return list.map(it => ({
      name: it.name,
      kind: it.content === undefined ? 'folder' : 'file',
    }));
  }

}

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
    const h = await this.#dir.getFileHandle(name, { create: true });
    const w = await h.createWritable();
    await w.write(content);
    await w.close();
  }

  async putFolder(name: string) {
    const h = await this.#dir.getDirectoryHandle(name, { create: true });
    return new UserFolder(h);
  }

  async list() {
    const list = [];
    const entries = this.#dir.entries();
    for await (const [name, obj] of entries) {
      const kind: 'folder' | 'file' = (obj.kind === 'directory') ? 'folder' : 'file';
      list.push({ name, kind });
    }
    return list;
  }

}

export class FS {

  drives: Record<string, Folder> = {
    a: new MemoryFolder(),
    b: new IndexedDbFolder('/'),
  };

  a = this.drives['a'];
  b = this.drives['b'];

  ready = new Promise<void>(async res => {
    await Promise.allSettled([
      this.#loadUserDrives(),
    ]);
    res();
  });

  async #loadUserDrives() {
    const db = await shareddb;
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

const shareddb = new Promise<IDBDatabase>(res => {
  const dbopenreq = window.indexedDB.open('fs', 1);
  dbopenreq.onerror = console.log;
  dbopenreq.onupgradeneeded = () => {
    const db = dbopenreq.result;
    db.createObjectStore('mounts', { keyPath: 'drive' });
    const files = db.createObjectStore('files', { keyPath: 'path' });
    files.createIndex('indexprefix', 'prefix', { unique: false });
  };
  dbopenreq.onsuccess = e => {
    const db = dbopenreq.result;
    res(db);
  };
});

function getdrives(db: IDBDatabase) {
  return new Promise<{ drive: string, folder: FileSystemDirectoryHandle }[]>(res => {
    const t = db.transaction('mounts', 'readonly');
    const store = t.objectStore('mounts');
    const all = store.getAll();
    all.onerror = console.log;
    all.onsuccess = (e) => res(all.result);
  });
}
