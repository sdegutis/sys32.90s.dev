import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content: string }>('idbfs', 'path');

class FolderFile {

  name: string;
  #content!: string;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }

  async init() { }

  get content() { return this.#content }
  set content(s: string) { this.#content = normalize(s) }

};

class Folder {

  name: string;
  folders: Folder[] = [];
  files: FolderFile[] = [];

  constructor(name: string) {
    this.name = name;
  }

  async init() { }

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

};

class SysDrive extends Folder {

  override async init() {
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
          next = new Folder(name);
          dir.addFolder(next);
        }
        dir = next;
      }

      const name = parts.shift()!;
      const file = new FolderFile(name, content);
      dir.addFile(file);
    }
  }

}

class UserDrive extends Folder {

  override async init() {
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

  constructor(name: string, handle: FileSystemDirectoryHandle) {
    super(name);
    this.handle = handle;
  }

  override async init() {
    for await (const [name, handle] of this.handle.entries()) {
      if (handle instanceof FileSystemDirectoryHandle) {
        const dir = new MountedFolder(name, handle);
        await dir.init();
        this.addFolder(dir);
      }
      else {
        const file = new MountedFile(name, handle);
        await file.init();
        this.addFile(file);
      }
    }

    const observer = new FileSystemObserver(async (records) => {
      for (const change of records) {
        console.log(this.name, change.type, change.changedHandle?.name, change.relativePathComponents)
        //   if (change.type === 'modified') {
        //     await this.pullData();
        //   }
        //   else if (change.type === 'disappeared' || change.type === 'errored') {
        //     observer.disconnect();
        //     this.parent!.childFileGone(this);
        //   }
      }
    });
    observer.observe(this.handle, {
      recursive: false,
    });
  }

}

class MountedFile extends FolderFile {

  handle;

  constructor(name: string, handle: FileSystemFileHandle) {
    super(name, '');
    this.handle = handle;
  }

  override async init() {
    this.pullData();

    // const observer = new FileSystemObserver(async (records) => {
    //   for (const change of records) {
    //     if (change.type === 'modified') {
    //       await this.pullData();
    //     }
    //     else if (change.type === 'disappeared' || change.type === 'errored') {
    //       observer.disconnect();
    //       this.parent!.childFileGone(this);
    //     }
    //   }
    // });
    // observer.observe(this.handle);
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

class Root extends Folder {

  constructor() {
    super('[root]');
  }

  removeDrive(child: string) {
    if (child === 'sys' || child === 'user') return;
    // this.remove(child);
    mounts.del(child);
  }

  async addDrive(drive: Folder) {
    this.folders.push(drive);
    await drive.init();
  }

}

class FS {

  #root = new Root();

  async init() {
    await this.#root.addDrive(new SysDrive('sys'));
    await this.#root.addDrive(new UserDrive('user'));
    for (const { drive, dir } of await mounts.all()) {
      await this.mount(drive, dir);
    }
  }

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    mounts.set({ drive, dir: folder });
    await this.#root.addDrive(new MountedFolder(drive, folder));
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
