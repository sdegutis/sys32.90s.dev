import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content: string }>('idbfs', 'path');

abstract class Drive implements Folder {

  name;
  folders: Folder[] = [];
  files: FolderFile[] = [];

  constructor(name: string) {
    this.name = name;
  }

  abstract init(): Promise<void>;

  remove(child: string) {

  }

}

class SysDrive extends Drive {

  async init() {
    const files = await fetch(import.meta.resolve('./data.json')).then(r => r.json());
    for (const file of files) {
      const data = await fetch(file).then(r => r.text());
      const path = file.slice('/os/data'.length);
      // addFile(path, data);
    }
  }

  // push(path: string, content: string): void { }

}

class UserDrive extends Drive {

  async init() {
    for (const { path, content } of await idbfs.all()) {
      // addFile(path, content);
    }
  }

  // push(path: string, content: string): void {
  //   idbfs.set({ path, content });
  // }

  override remove(child: string) {

    super.remove(child);

    // const files = await idbfs.all();
  }

}

class MountedFolder implements Folder {

  name;
  folders: MountedFolder[] = [];
  files: MountedFile[] = [];

  constructor(name: string) {
    this.name = name;
  }

  // override remove(child: string) {

  //   super.remove(child);

  //   // const files = await idbfs.all();
  // }

}

class MountedFile implements FolderFile {

  name;
  content;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }

}

class MountedDrive extends Drive {

  root: FileSystemDirectoryHandle;

  constructor(name: string, dir: FileSystemDirectoryHandle) {
    super(name);
    this.root = dir;
  }

  async init() {
    // await this.#loaddir(this.root, '/');

    // const observer = new FileSystemObserver((records) => {
    //   for (const change of records) {
    //     const path = '/' + change.relativePathComponents.join('/');
    //   }

    // });
    // observer.observe(this.root, { recursive: true });
  }

  // async #loaddir(dir: FileSystemDirectoryHandle, path: string) {
  //   // this.dhs.set(path, dir);
  //   console.log('loading dir', path, dir)


  //   for await (const [name, entry] of dir.entries()) {
  //     const fullpath = `${path}${name}`;
  //     if (entry.kind === 'directory') {
  //       await this.#loaddir(entry, fullpath)
  //     }
  //     else {
  //       const h = await dir.getFileHandle(name);
  //       console.log('loading file', fullpath, h)
  //       const f = await h.getFile();
  //       const data = await f.text();

  //       // addFile(fullpath, data);
  //     }
  //   }
  // }

  // async push(path: string, content: string) {
  //   const h = await this.#dir.getFileHandle(name, { create: true });
  //   const w = await h.createWritable();
  //   await w.write(content);
  //   await w.close();
  // }

  // remove(child: string) {
  // }

}

export type FolderFile = {
  name: string;
  content: string;
};

export type Folder = {
  name: string;
  folders: Folder[];
  files: FolderFile[];
};

class Root extends Drive {

  constructor() {
    super('[root]');
  }

  async init() {

  }

  override remove(child: string) {
    if (child === 'sys' || child === 'user') return;
    super.remove(child);



    // const i = this.#root.folders.findIndex(f => f.name === drive);
    // this.#root.folders.splice(i, 1);

  }

}

class FS {

  #root = new Root();

  async init() {
    await this.#initdrive(new SysDrive('sys'));
    await this.#initdrive(new UserDrive('user'));
    for (const { drive, dir } of await mounts.all()) {
      await this.mount(drive, dir);
    }
  }

  async #initdrive(drive: Drive) {
    this.#root.folders.push(drive);
    await drive.init();
  }

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    mounts.set({ drive, dir: folder });
    await this.#initdrive(new MountedDrive(drive, folder));
  }

  unmount(drive: string) {
    this.#root.remove(drive);
    mounts.del(drive);
  }

  #reflectChanges(drive: string, change: FileSystemObserverRecord) {
    const parts = [drive, ...change.relativePathComponents];
    // content = normalize(content);
  }

  #addfile(drive: string, path: string, content: string) {
    content = normalize(content);
    const parts = (drive + path).split('/');
    const file = parts.pop()!;
    const dir = this.#nav(parts, { mkdirp: true });
    dir.files.push({ name: file, content });
    dir.files.sort(sortBy(f => f.name));
  }

  #nav(parts: string[], opts?: { mkdirp?: boolean, pop?: boolean }) {
    let current: Folder = this.#root;
    while (parts.length > 0) {
      const part = parts.shift()!;
      let found = current.folders.find(f => f.name === part);
      if (!found) {
        if (!opts?.mkdirp) throw new Error(`Folder not found: [${parts.join('/')}]`);
        found = { files: [], folders: [], name: part };
        current.folders.push(found);
        current.folders.sort(sortBy(f => f.name));
      }
      current = found;
    }
    return current;
  }

  drives() {
    return this.#root.folders.map(f => f.name);
  }

  getFolder(path: string) {
    return this.#nav(path.split('/'));
  }

  loadFile(path: string): string | undefined {
    const parts = path.split('/');
    const file = parts.pop()!;
    const dir = this.#nav(parts);
    return dir.files.find(f => f.name === file)?.content;
  }

  delete(path: string) {

  }

  mkdir(path: string) {

  }

  saveFile(filepath: string, content: string) {
    content = normalize(content);

    const parts = filepath.split('/');
    const file = parts.pop()!;
    const dir = this.#nav(parts);

    const existing = dir.files.find(f => f.name === file);
    if (existing) {
      existing.content = content;
    }
    else {
      dir.files.push({ name: file, content });
    }

    dir.files.sort(sortBy(f => f.name));

    // const [drive, path] = this.#split(fullpath);
    // drive.push(path, content);

    for (const [watched, fn] of this.#watchers) {
      if (watched.startsWith(filepath)) {
        fn.dispatch(content);
      }
    }
  }

  #watchers = new Map<string, Listener<string>>();

  watchTree(path: string, fn: (content: string) => void) {
    let watcher = this.#watchers.get(path);
    if (!watcher) this.#watchers.set(path, watcher = new Listener());
    return watcher.watch(fn);
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
