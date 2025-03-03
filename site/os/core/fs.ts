import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content: string }>('idbfs', 'path');

class FolderFile {

  name: string;
  content: string;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = normalize(content);
  }

};

class Folder {

  name: string;
  folders: Folder[] = [];
  files: FolderFile[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addFolder(folder: Folder) {
    this.folders.push(folder);
    this.folders.sort(sortBy(f => f.name));
  }

  addFile(file: FolderFile) {
    this.files.push(file);
    this.files.sort(sortBy(f => f.name));
  }

  remove(child: string) {
    // const i = this.#root.folders.findIndex(f => f.name === drive);
    // this.#root.folders.splice(i, 1);
  }

  find(parts: string[]) {
    let current: Folder = this;
    while (parts.length > 0) {
      const part = parts.shift()!;
      let found = current.folders.find(f => f.name === part);
      if (!found) {
        throw new Error(`Folder not found: [${parts.join('/')}]`);
      }
      current = found;
    }
    return current;
  }

};

interface Drive extends Folder {

  init(): Promise<void>;

}

class SysDrive extends Folder implements Drive {

  async init() {
    const paths = await fetch(import.meta.resolve('./data.json')).then<string[]>(r => r.json());

    for (const path of paths) {
      const content = await fetch(path).then(r => r.text());
      const fixedpath = path.slice('/os/data/'.length);
      const parts = fixedpath.split('/');

      let dir: Folder = this;
      while (parts.length > 1) {
        const name = parts.shift()!;
        const next = new Folder(name);
        dir.addFolder(next);
        dir = next;
      }

      const name = parts.shift()!;
      const file = new FolderFile(name, content);
      dir.addFile(file);
    }
  }

}

class UserDrive extends Folder implements Drive {

  async init() {
    for (const { path, content } of await idbfs.all()) {
      // addFile(path, content);
    }
  }

  // push(path: string, content: string): void {
  //   idbfs.set({ path, content });
  // }

  // override remove(child: string) {
  //   super.remove(child);
  //   // const files = await idbfs.all();
  // }

}

class MountedFolder extends Folder {

  override folders: MountedFolder[] = [];
  override files: MountedFile[] = [];

  constructor(name: string) {
    super(name);
  }

  async loaddir(dir: FileSystemDirectoryHandle) {

    // const observer = new FileSystemObserver((records) => {
    //   for (const change of records) {
    //     const path = '/' + change.relativePathComponents.join('/');
    //   }

    for await (const [name, entry] of dir.entries()) {
      if (entry instanceof FileSystemDirectoryHandle) {
        const dir = new MountedFolder(name);
        this.addFolder(dir);
        await dir.loaddir(entry);
      }
      else {
        const f = await entry.getFile();
        const data = await f.text();
        const file = new MountedFile(name, data);
        this.addFile(file);
      }
    }
  }

}

class MountedFile extends FolderFile {

  // async push(path: string, content: string) {
  //   const h = await this.#dir.getFileHandle(name, { create: true });
  //   const w = await h.createWritable();
  //   await w.write(content);
  //   await w.close();
  // }

}

class MountedDrive extends MountedFolder implements Drive {

  root: FileSystemDirectoryHandle;

  constructor(name: string, dir: FileSystemDirectoryHandle) {
    super(name);
    this.root = dir;
  }

  async init() {
    await this.loaddir(this.root);
  }

}

class Root extends Folder {

  constructor() {
    super('[root]');
  }

  override remove(child: string) {
    if (child === 'sys' || child === 'user') return;
    super.remove(child);
    mounts.del(child);
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

  // #reflectChanges(drive: string, change: FileSystemObserverRecord) {
  //   const parts = [drive, ...change.relativePathComponents];
  //   // content = normalize(content);
  // }

  drives() {
    return this.#root.folders.map(f => f.name);
  }

  getFolder(path: string) {
    return this.#root.find(path.split('/'));
  }

  loadFile(path: string): string | undefined {
    const parts = path.split('/');
    const file = parts.pop()!;
    const dir = this.#root.find(parts);
    return dir.files.find(f => f.name === file)?.content;
  }

  saveFile(filepath: string, content: string) {
    // content = normalize(content);

    // const parts = filepath.split('/');
    // const file = parts.pop()!;
    // const dir = this.#nav(parts);

    // const existing = dir.files.find(f => f.name === file);
    // if (existing) {
    //   existing.content = content;
    // }
    // else {
    //   dir.files.push({ name: file, content });
    // }

    // dir.files.sort(sortBy(f => f.name));

    // // const [drive, path] = this.#split(fullpath);
    // // drive.push(path, content);

    // for (const [watched, fn] of this.#watchers) {
    //   if (watched.startsWith(filepath)) {
    //     fn.dispatch(content);
    //   }
    // }
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
