import { Listener } from "../util/events.js";

const mounts = await opendb<{
  drive: string,
  dir: FileSystemDirectoryHandle,
}>('mounts', 'drive');

const idbfs = await opendb<{
  path: string,
  content: string,
}>('idbfs', 'path');

// class UserFolder implements Folder {

//   path: string;
//   #dir: FileSystemDirectoryHandle;

//   constructor(dir: FileSystemDirectoryHandle, path: string) {
//     this.path = path;
//     this.#dir = dir;
//   }

//   async getFile(name: string) {
//     const h = await this.#dir.getFileHandle(name);
//     const f = await h.getFile();
//     return await f.text();
//   }

//   async getFolder(name: string) {
//     const h = await this.#dir.getDirectoryHandle(name);
//     return new UserFolder(h, this.path + name + '/');
//   }

//   async putFile(name: string, content: string) {
//     const h = await this.#dir.getFileHandle(name, { create: true });
//     const w = await h.createWritable();
//     await w.write(content);
//     await w.close();
//   }

//   async putFolder(name: string) {
//     const h = await this.#dir.getDirectoryHandle(name, { create: true });
//     return new UserFolder(h, this.path + name + '/');
//   }

//   async list() {
//     const list = [];
//     const entries = this.#dir.entries();
//     for await (const [name, obj] of entries) {
//       const kind: 'folder' | 'file' = (obj.kind === 'directory') ? 'folder' : 'file';
//       list.push({ name, kind });
//     }
//     return list;
//   }

//   async delFile(name: string): Promise<void> {
//     this.#dir.removeEntry(name);
//   }

//   async delFolder(name: string): Promise<void> {
//     this.#dir.removeEntry(name);
//   }

// }

abstract class Drive {

  entries = new Map<string, string>();

  save?(path: string, content: string): void;

}

class MemoryDrive extends Drive {

}

class IdbDrive extends Drive {

  override save(path: string, content: string): void {
    idbfs.set({ path, content });
  }

}

class MountedRealDrive extends Drive {

  constructor(dir: FileSystemDirectoryHandle) {
    super();
  }

  override save(path: string, content: string): void {

  }

}

export type FolderEntry = { name: string, kind: 'file' | 'folder' };

function sortBy<T, U>(fn: (o: T) => U) {
  return (a: T, b: T) => {
    const aa = fn(a);
    const bb = fn(b);
    if (aa < bb) return -1;
    if (aa > bb) return +1;
    return 0;
  };
}

class FS {

  #drives: Record<string, Drive> = {
    sys: new MemoryDrive(),
    user: new IdbDrive(),
  };

  mountUserFolder(drive: string, folder: FileSystemDirectoryHandle) {
    if (drive in this.#drives) return;
    mounts.set({ drive, dir: folder });
    this.#drives[drive] = new MountedRealDrive(folder);

    // const observer = new FileSystemObserver((records) => {
    //   console.log(records)
    // });
    // observer.observe(folder, { recursive: true });
    // // observer.disconnect

  }

  drives() {
    return Object.keys(this.#drives);
  }

  list(fullpath: string): FolderEntry[] {
    const [drive, path] = this.#split(fullpath)
    console.log('list', drive, path, drive.entries)
    // files.sort(sortBy(f => (f.kind === 'folder' ? 1 : 2) + f.name));
    return [];
  }

  loadFile(fullpath: string): string | undefined {
    const [drive, path] = this.#split(fullpath)
    return drive.entries.get(path);
  }

  saveFile(fullpath: string, content: string) {
    const [drive, path] = this.#split(fullpath)
    drive.entries.set(path, content);
    drive.save?.(path, content);
    this.#watchers.get(path)?.dispatch(content);
  }

  #split<T>(fullpath: string) {
    const i = fullpath.indexOf('/');
    const drivename = fullpath.slice(0, i);
    const drivepath = fullpath.slice(i);
    return [this.#drives[drivename], drivepath] as const;
  }

  #watchers = new Map<string, Listener<string>>();

  watchTree(path: string, fn: (content: string) => void) {
    let watcher = this.#watchers.get(path);
    if (!watcher) this.#watchers.set(path, watcher = new Listener());
    watcher.watch(fn);
  }

}

async function opendb<T>(dbname: string, key: keyof T & string) {
  const db = await new Promise<IDBDatabase>(resolve => {
    const r = window.indexedDB.open(dbname, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('kvs', { keyPath: key }); };
    r.onsuccess = () => { resolve(r.result); };
  });

  async function run<U>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<U>) {
    const p = Promise.withResolvers<U>();
    const t = db.transaction('kvs', mode);
    const r = fn(t.objectStore('kvs'));
    r.onsuccess = () => p.resolve(r.result);
    return p.promise;
  }

  return {
    all: async () => run<T[]>('readonly', store => store.getAll()),
    set: async (val: T) => run('readwrite', store => store.put(val)),
    get: async (key: string) => run<T>('readonly', store => store.get(key)),
    del: async (key: string) => run('readwrite', store => store.delete(key)),
  };
}

async function loadSystemData() {
  const files = await fetch(import.meta.resolve('./data.json')).then(r => r.json());
  for (const file of files) {
    const data = await fetch(file).then(r => r.text());
    const path = `sys/` + file.slice('/sys32/data/'.length);
    fs.saveFile(path, data);
  }
}

async function loadIdbDrive() {
  for (const { path, content } of await idbfs.all()) {
    fs.saveFile(`user${path}`, content);
  }
}

async function loadMountedDrives() {
  for (const { drive, dir } of await mounts.all()) {
    fs.mountUserFolder(drive, dir);
  }
}

export const fs = new FS();
await loadSystemData();
await loadIdbDrive();
await loadMountedDrives();
