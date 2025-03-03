import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content: string }>('idbfs', 'path');

class FolderFile {

  name: string;
  parent: Folder | undefined;
  #content!: string;

  constructor(name: string, content: string, parent: Folder | undefined) {
    this.name = name;
    this.parent = parent;
    this.content = content;
  }

  get content() { return this.#content }
  set content(s: string) { this.#content = normalize(s) }

};

class Folder {

  name: string;
  parent: Folder;
  folders: Folder[] = [];
  files: FolderFile[] = [];

  constructor(name: string, parent: Folder) {
    this.name = name;
    this.parent = parent;
  }

  addFolder(folder: Folder) {
    this.folders.push(folder);
    this.folders.sort(sortBy(f => f.name));
  }

  addFile(file: FolderFile) {
    this.files.push(file);
    this.files.sort(sortBy(f => f.name));
  }

  // remove(child: string) {
  //   const i = this.folders.findIndex(f => f.name === child);
  //   this.folders.splice(i, 1);
  // }

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

  childFileGone(child: MountedFile) {
    // this.files.
  }

  childFolderGone(child: MountedFolder) {

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
        let next = dir.folders.find(f => f.name === name);
        if (!next) {
          next = new Folder(name, dir);
          dir.addFolder(next);
        }
        dir = next;
      }

      const name = parts.shift()!;
      const file = new FolderFile(name, content, dir);
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

  handle: FileSystemDirectoryHandle;

  override folders: MountedFolder[] = [];
  override files: MountedFile[] = [];

  constructor(name: string, parent: Folder, handle: FileSystemDirectoryHandle) {
    super(name, parent);
    this.handle = handle;
  }

  async loaddir() {

    // const observer = new FileSystemObserver((records) => {
    //   for (const change of records) {
    //     const path = '/' + change.relativePathComponents.join('/');
    //   }

    for await (const [name, handle] of this.handle.entries()) {
      if (handle instanceof FileSystemDirectoryHandle) {
        const dir = new MountedFolder(name, this, handle);
        this.addFolder(dir);
        await dir.loaddir();
      }
      else {
        const file = new MountedFile(name, this, handle);
        await file.pullData();
        this.addFile(file);
      }
    }
  }

}

class MountedFile extends FolderFile {

  handle;

  constructor(name: string, parent: Folder, handle: FileSystemFileHandle) {
    super(name, '', parent);
    this.handle = handle;

    const observer = new FileSystemObserver(async (records) => {
      for (const change of records) {
        if (change.type === 'modified') {
          await this.pullData();
        }
        else if (change.type === 'disappeared' || change.type === 'errored') {
          observer.disconnect();
          this.parent!.childFileGone(this);
        }
      }
    });
    observer.observe(handle);
  }

  async pullData() {
    const f = await this.handle.getFile();
    this.content = await f.text();
  }

  async pushData(content: string) {
    const w = await this.handle.createWritable();
    await w.write(content);
    await w.close();
  }

}

class MountedDrive extends MountedFolder implements Drive {

  async init() {
    await this.loaddir();
  }

}

class Root extends Folder {

  constructor() {
    super('[root]', undefined!);
  }

  removeDrive(child: string) {
    if (child === 'sys' || child === 'user') return;
    // this.remove(child);
    mounts.del(child);
  }

  async addDrive(drive: Drive) {
    this.folders.push(drive);
    await drive.init();
  }

}

class FS {

  #root = new Root();

  async init() {
    await this.#root.addDrive(new SysDrive('sys', this.#root));
    await this.#root.addDrive(new UserDrive('user', this.#root));
    for (const { drive, dir } of await mounts.all()) {
      await this.mount(drive, dir);
    }
  }

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    mounts.set({ drive, dir: folder });
    await this.#root.addDrive(new MountedDrive(drive, this.#root, folder));
  }

  unmount(drive: string) {
    mounts.del(drive);
    this.#root.removeDrive(drive);
  }

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
    const parts = filepath.split('/');
    const file = parts.pop()!;
    const dir = this.#root.find(parts);



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
