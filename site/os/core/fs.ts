import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content: string }>('idbfs', 'path');

interface Drive {
  files: Map<string, string>;
  init(): Promise<void>;
  push(path: string, content: string): void;
}

class SysDrive implements Drive {

  files = new Map<string, string>();

  async init() {
    const files = await fetch(import.meta.resolve('./data.json')).then(r => r.json());
    for (const file of files) {
      const data = normalize(await fetch(file).then(r => r.text()));
      const path = file.slice('/os/data'.length);
      this.files.set(path, data);
    }
  }

  push(path: string, content: string): void { }

}

class UserDrive implements Drive {

  files = new Map<string, string>();

  async init() {
    for (const { path, content } of await idbfs.all()) {
      this.files.set(path, normalize(content));
    }
  }

  push(path: string, content: string): void {
    idbfs.set({ path, content });
  }

}

class MountedDrive implements Drive {

  files = new Map<string, string>();

  root: FileSystemDirectoryHandle;
  dhs = new Map<string, FileSystemDirectoryHandle>();
  fhs = new Map<string, FileSystemFileHandle>();

  changed;

  constructor(dir: FileSystemDirectoryHandle, changed: (path: string, content: string) => void) {
    this.root = dir;
    this.changed = changed;
  }

  async init() {
    await this.#loaddir(this.root, '/');

    // const observer = new FileSystemObserver((records) => {
    //   console.log(records)
    // });
    // observer.observe(this.root, { recursive: true });
    // observer.disconnect

  }

  async #loaddir(dir: FileSystemDirectoryHandle, path: string) {
    this.dhs.set(path, dir);

    for await (const [name, entry] of dir.entries()) {
      if (entry.kind === 'directory') {
        await this.#loaddir(entry, `${path}${name}/`)
      }
      else {
        const fullpath = `${path}${name}`;
        this.fhs.set(fullpath, entry);

        const h = await dir.getFileHandle(name);
        const f = await h.getFile();
        const data = await f.text();

        this.files.set(fullpath, normalize(data));
      }
    }
  }

  push(path: string, content: string): void {
    // const h = await this.#dir.getFileHandle(name, { create: true });
    // const w = await h.createWritable();
    // await w.write(content);
    // await w.close();
  }

}

export type FolderEntry = { name: string, kind: 'file' | 'folder' };

class FS {

  #drives: Record<string, Drive> = {
    sys: new SysDrive(),
    user: new UserDrive(),
  };

  async init() {
    for (const drive of Object.values(this.#drives)) {
      await drive.init();
    }
    for (const { drive, dir } of await mounts.all()) {
      await this.mountUserFolder(drive, dir);
    }
  }

  async mountUserFolder(drive: string, folder: FileSystemDirectoryHandle) {
    if (drive in this.#drives) return;
    mounts.set({ drive, dir: folder });
    const mounted = new MountedDrive(folder, (path, content) => {
      this.#watchers.get(path)?.dispatch(content);
    });
    mounted
    this.#drives[drive] = mounted;
    await mounted.init();
  }

  drives() {
    return Object.keys(this.#drives);
  }

  list(fullpath: string): FolderEntry[] {
    const [drive, path] = this.#split(fullpath);

    // console.log(drive.files.entries().filter(([path, content])))

    // console.log(drive, path)
    // console.log('list', drive, path, this.#entries)
    // // files.sort(sortBy(f => (f.kind === 'folder' ? 1 : 2) + f.name));
    return [];
  }

  loadFile(fullpath: string): string | undefined {
    const [drive, path] = this.#split(fullpath);
    return drive.files.get(path);
  }

  saveFile(fullpath: string, content: string) {
    content = normalize(content);
    const [drive, path] = this.#split(fullpath)
    drive.files.set(fullpath, content);
    drive.push(path, content);
    this.#watchers.get(fullpath)?.dispatch(content);
  }

  #split<T>(fullpath: string) {
    const i = fullpath.indexOf('/');
    const drivename = fullpath.slice(0, i);
    const drivepath = fullpath.slice(i);
    return [this.#drives[drivename], drivepath] as const;
  }

  #watchers = new Map<string, Listener<string>>();

  watchFile(path: string, fn: (content: string) => void) {
    let watcher = this.#watchers.get(path);
    if (!watcher) this.#watchers.set(path, watcher = new Listener());
    watcher.watch(fn);
  }

}

function normalize(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

function sortBy<T, U>(fn: (o: T) => U) {
  return (a: T, b: T) => {
    const aa = fn(a);
    const bb = fn(b);
    if (aa < bb) return -1;
    if (aa > bb) return +1;
    return 0;
  };
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

export const fs = new FS();
await fs.init();
