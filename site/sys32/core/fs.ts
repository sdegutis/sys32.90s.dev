export interface Folder {

  path: string;

  getFile(name: string): Promise<string | undefined>;
  getFolder(name: string): Promise<Folder | undefined>;

  putFile(name: string, content: string): Promise<void>;
  putFolder(name: string): Promise<Folder>;

  delFile(name: string): Promise<void>;
  delFolder(name: string): Promise<void>;

  list(): Promise<{ kind: 'file' | 'folder', name: string }[]>;

}

class MemoryFolder implements Folder {

  path: string;
  constructor(path: string) {
    this.path = path;
  }

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
    const f = new MemoryFolder(this.path + name + '/');
    this.#items[name] = f;
    return f;
  }

  async list() {
    return Object.keys(this.#items).map(name => {
      const kind: 'file' | 'folder' = typeof name === 'string' ? 'file' : 'folder';
      return { name, kind };
    });
  }

  async delFile(name: string): Promise<void> {
    delete this.#items[name];
  }

  async delFolder(name: string): Promise<void> {
    delete this.#items[name];
  }

}

class IndexedDbFolder implements Folder {

  path: string;
  #db: IDBDatabase;
  #prefix: string;

  constructor(db: IDBDatabase, prefix: string) {
    this.path = prefix;
    this.#db = db;
    this.#prefix = prefix;
  }

  async getFile(name: string) {
    const item = await this.#getitem(name);
    return item.content;
  }

  async getFolder(name: string) {
    const item = await this.#getitem(name);
    return item && new IndexedDbFolder(this.#db, this.#prefix + name + '/');
  }

  async putFile(name: string, content: string) {
    return await new Promise<void>(resolve => {
      const t = this.#db.transaction('files', 'readwrite');
      const store = t.objectStore('files');
      const r = store.put({
        name,
        prefix: this.#prefix,
        path: this.#prefix + name,
        content,
      });
      r.onerror = console.error;
      r.onsuccess = res => resolve();
    });
  }

  async putFolder(name: string) {
    await new Promise<void>(resolve => {
      const t = this.#db.transaction('files', 'readwrite');
      const store = t.objectStore('files');
      const r = store.put({
        name,
        prefix: this.#prefix,
        path: this.#prefix + name,
      });
      r.onerror = console.error;
      r.onsuccess = res => resolve();
    });
    return new IndexedDbFolder(this.#db, this.#prefix + name + '/');
  }

  async #getitem(name: string) {
    return await new Promise<DbFile>(resolve => {
      const t = this.#db.transaction('files', 'readonly');
      const store = t.objectStore('files');
      const r = store.get(this.#prefix + name);
      r.onerror = console.error;
      r.onsuccess = (e: any) => resolve(e.target.result);
    });
  }

  async list(): Promise<{ kind: "file" | "folder"; name: string; }[]> {
    const list = await new Promise<DbFile[]>(resolve => {
      const t = this.#db.transaction('files', 'readonly');
      const store = t.objectStore('files');
      const index = store.index('indexprefix');
      const r = index.getAll(this.#prefix);
      r.onerror = console.error;
      r.onsuccess = (e: any) => resolve(e.target.result);
    });
    return list.map(it => ({
      name: it.name,
      kind: it.content === undefined ? 'folder' : 'file',
    }));
  }

  async delFile(name: string): Promise<void> {
    await this.#delitem(name);
  }

  async delFolder(name: string): Promise<void> {
    await this.#delitem(name);
  }

  async #delitem(name: string): Promise<void> {
    await new Promise<DbFile>(resolve => {
      const t = this.#db.transaction('files', 'readonly');
      const store = t.objectStore('files');
      const r = store.delete(this.#prefix + name);
      r.onerror = console.error;
      r.onsuccess = (e: any) => resolve(e.target.result);
    });
  }

}

class UserFolder implements Folder {

  path: string;
  #dir: FileSystemDirectoryHandle;

  constructor(dir: FileSystemDirectoryHandle, path: string) {
    this.path = path;
    this.#dir = dir;
  }

  async getFile(name: string) {
    const h = await this.#dir.getFileHandle(name);
    const f = await h.getFile();
    return await f.text();
  }

  async getFolder(name: string) {
    const h = await this.#dir.getDirectoryHandle(name);
    return new UserFolder(h, this.path + name + '/');
  }

  async putFile(name: string, content: string) {
    const h = await this.#dir.getFileHandle(name, { create: true });
    const w = await h.createWritable();
    await w.write(content);
    await w.close();
  }

  async putFolder(name: string) {
    const h = await this.#dir.getDirectoryHandle(name, { create: true });
    return new UserFolder(h, this.path + name + '/');
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

  async delFile(name: string): Promise<void> {
    this.#dir.removeEntry(name);
  }

  async delFolder(name: string): Promise<void> {
    this.#dir.removeEntry(name);
  }

}

export class FS {

  #db = new Promise<IDBDatabase>(resolve => {
    const r = window.indexedDB.open('fs', 1);
    r.onerror = console.error;
    r.onupgradeneeded = () => {
      const db = r.result;
      db.createObjectStore('mounts', { keyPath: 'drive' });
      const files = db.createObjectStore('files', { keyPath: 'path' });
      files.createIndex('indexprefix', 'prefix', { unique: false });
    };
    r.onsuccess = e => {
      const db = r.result;
      resolve(db);
    };
  });

  drives = new Promise<Record<string, Folder>>(async resolve => {
    const db = await this.#db;
    const drives = {
      a: new MemoryFolder('a/'),
      b: new IndexedDbFolder(db, 'b/'),
    };
    await this.#loadUserDrives(db, drives);
    resolve(drives);
  });

  async #loadUserDrives(db: IDBDatabase, drives: Record<string, Folder>) {
    const found = await new Promise<DbMount[]>(resolve => {
      const t = db.transaction('mounts', 'readonly');
      const store = t.objectStore('mounts');
      const r = store.getAll();
      r.onerror = console.error;
      r.onsuccess = (e) => resolve(r.result);
    });
    for (const { drive, folder } of found) {
      drives[drive] = new UserFolder(folder, drive + '/');
    }
  }

  async mountUserFolder(drive: string, dir: FileSystemDirectoryHandle) {
    const db = await this.#db;
    await new Promise<void>(resolve => {
      const t = db.transaction('mounts', 'readwrite');
      const store = t.objectStore('mounts');
      store.add({ drive, folder: dir });
      t.onerror = console.error;
      t.oncomplete = e => resolve();
    });
    const folder = new UserFolder(dir, drive + '/');
    (await this.drives)[drive] = folder;
    return folder;
  }

  async getFolder(path: string) {
    const found = await this.#getdir(path);
    if (!found) return undefined;
    if (!found.base) return found.folder;
    return found.folder.getFolder(found.base);
  }

  async loadFile(path: string): Promise<string | null> {
    const file = await this.#getdir(path);
    if (!file) return null;

    const found = await file.folder.getFile(file.base);
    return found ?? null;
  }

  async saveFile(path: string, content: string) {
    const file = await this.#getdir(path);
    if (!file) return;

    file.folder.putFile(file.base, content);
  }

  async #getdir(path: string) {
    const segments = path.split('/');

    const drive = segments.shift()!;
    let folder: Folder = (await this.drives)[drive];

    while (segments.length > 1) {
      const nextName = segments.shift()!;
      const nextFolder = await folder.getFolder(nextName);

      if (!nextFolder) {
        console.error(`No item in folder named "${nextName}"`);
        return null;
      }

      folder = nextFolder;
    }

    return { folder, base: segments.pop()! };
  }

}

type DbMount = {
  drive: string,
  folder: FileSystemDirectoryHandle
};

type DbFile = {
  name: string,
  path: string,
  prefix: string,
  content?: string,
};

export const fs = new FS();
