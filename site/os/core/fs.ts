import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content?: string }>('idbfs', 'path');

class FileNode {

  name: string;
  #content;

  constructor(name: string, content: string) {
    this.name = name;
    this.#content = content;
  }

  get content() { return this.#content }
  set content(s: string) { this.#content = this.#normalize(s) }

  #normalize(content: string): string {
    return content.replace(/\r\n/g, '\n');
  }

  push() { }

};

class DirNode {

  name: string;
  items: (DirNode | FileNode)[] = [];

  constructor(name: string) {
    this.name = name;
  }

  get files() {
    return this.items.filter(it => it instanceof FileNode);
  }

  get folders() {
    return this.items.filter(it => it instanceof DirNode);
  }

  getFolder(name: string) {
    return this.items.find(f => f.name === name && f instanceof DirNode) as DirNode | undefined;
  }

  getFile(name: string) {
    return this.items.find(f => f.name === name && f instanceof FileNode) as FileNode | undefined;
  }

  add(item: FileNode | DirNode) {
    this.items.push(item);
    this.items.sort(sortBy(f => f.name));
  }

  del(child: string) {
    const i = this.items.findIndex(f => f.name === child);
    this.items.splice(i, 1);
  }

  findDir(parts: string[]) {
    let current: DirNode = this;
    while (parts.length > 0) {
      const part = parts.shift()!;
      let found = current.getFolder(part);
      if (!found) {
        throw new Error(`Folder not found: [${parts.join('/')}]`);
      }
      current = found;
    }
    return current;
  }

  async createFolder(name: string) {
    return new DirNode(name);
  }

  async createFile(name: string, content: string) {
    return new FileNode(name, content);
  }

  async getOrCreateFile(name: string, content: string) {
    let file = this.getFile(name);
    if (!file) {
      file = await this.createFile(name, content);
      this.add(file);
    }
    file.content = content;
    file.push();
    return file;
  }

  async getOrCreateFolder(name: string) {
    let dir = this.getFolder(name);
    if (!dir) {
      dir = await this.createFolder(name);
      this.add(dir);
    }
    return dir;
  }

};

interface Drive extends DirNode {

  init(): Promise<void>;
  deinit?(): void;

}

class SysDrive extends DirNode {

  async init() {
    const paths = await fetch(import.meta.resolve('./data.json')).then<string[]>(r => r.json());

    for (const path of paths) {
      const content = await fetch(path).then(r => r.text());
      const fixedpath = path.slice('/os/data/'.length);
      const parts = fixedpath.split('/');

      let dir: DirNode = this;
      while (parts.length > 1) {
        const name = parts.shift()!;
        let next = dir.getFolder(name);
        if (!next) {
          next = new DirNode(name);
          dir.add(next);
        }
        dir = next;
      }

      const name = parts.shift()!;
      const file = new FileNode(name, content);
      dir.add(file);
    }
  }

}

class UserDrive extends DirNode implements Drive {

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

class MountedFolder extends DirNode implements Drive {

  handle: FileSystemDirectoryHandle;

  override items: (MountedFolder | MountedFile)[] = [];

  constructor(name: string, handle: FileSystemDirectoryHandle) {
    super(name);
    this.handle = handle;
  }

  async init() {
    for await (const [name, handle] of this.handle.entries()) {
      await this.addentry(name, handle);
    }
  }

  async addentry(name: string, handle: FileSystemDirectoryHandle | FileSystemFileHandle) {
    const item = this.items.find(it => it.name === name);
    if (item) {
      item.handle = handle;
      return;
    }

    if (handle instanceof FileSystemDirectoryHandle) {
      const dir = new MountedFolder(name, handle);
      await dir.init();
      this.add(dir);
    }
    else {
      const file = new MountedFile(name, handle);
      await file.pull();
      this.add(file);
    }
  }

  override async createFolder(name: string) {
    const handle = await this.handle.getDirectoryHandle(name, { create: true });
    return new MountedFolder(name, handle);
  }

  override async createFile(name: string): Promise<MountedFile> {
    const handle = await this.handle.getFileHandle(name, { create: true });
    return new MountedFile(name, handle);
  }

}

class MountedDrive extends MountedFolder implements Drive {

  observer!: FileSystemObserver;

  constructor(name: string, handle: FileSystemDirectoryHandle) {
    super(name, handle);

    let processChanges = Promise.resolve();
    this.observer = new FileSystemObserver(changes => {
      processChanges = processChanges.then(async () => {
        for (const change of changes) {
          await this.#handleChange(change);
        }
      });
    });
    this.observer.observe(this.handle, { recursive: true });
  }

  deinit(): void {
    this.observer.disconnect();
  }

  override findDir(parts: string[]): MountedFolder {
    return super.findDir(parts) as MountedFolder;
  }

  async #handleChange(change: FileSystemObserverRecord) {
    if (change.type === 'unknown') {
      console.warn('unknown fs event', change);
      return;
    }

    if (change.type === 'moved') {
      const parts = [...change.relativePathMovedFrom];
      const name = parts.pop()!;
      const dir = this.findDir(parts);
      const f = dir.items.find(f => f.name === name)!;

      f.handle = change.changedHandle;
      f.name = change.relativePathComponents.at(-1)!;
      return;
    }

    const parts = [...change.relativePathComponents];
    const name = parts.pop()!;
    const dir = this.findDir(parts);

    if (change.type === 'appeared') {
      await dir.addentry(name, change.changedHandle);
      return;
    }

    if (change.type === 'modified') {
      const file = dir.getFile(name) as MountedFile;
      await file.pull();
      return;
    }

    if (change.type === 'disappeared' || change.type === 'errored') {
      dir.del(name);
      return;
    }
  }

}


class MountedFile extends FileNode {

  handle: FileSystemFileHandle;

  constructor(name: string, handle: FileSystemFileHandle) {
    super(name, '');
    this.handle = handle;
  }

  async pull() {
    const f = await this.handle.getFile();
    this.content = await f.text();
  }

  override async push() {
    const w = await this.handle.createWritable();
    await w.write(this.content);
    await w.close();
  }

}

class Root extends DirNode {

  constructor() {
    super('[root]');
  }

  removeDrive(child: string) {
    if (child === 'sys' || child === 'user') return;
    const folder = this.getFolder(child) as Drive;
    folder.deinit?.();
    this.del(child);
    mounts.del(child);
  }

  async addDrive(drive: Drive) {
    this.add(drive);
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
    await this.#root.addDrive(new MountedDrive(drive, folder));
  }

  unmount(drive: string) {
    mounts.del(drive);
    this.#root.removeDrive(drive);
  }

  drives() {
    return this.#root.items.map(f => f.name);
  }

  async mkdirp(path: string) {
    let node: DirNode = this.#root;
    const parts = path.split('/');
    while (parts.length > 0) {
      const name = parts.shift()!;
      node = await node.getOrCreateFolder(name);
    }
    return node;
  }

  getFolder(path: string) {
    return this.#root.findDir(path.split('/'));
  }

  loadFile(path: string): string | undefined {
    const parts = path.split('/');
    const file = parts.pop()!;
    const dir = this.#root.findDir(parts);
    return dir.getFile(file)?.content;
  }

  async saveFile(filepath: string, content: string) {
    const parts = filepath.split('/');
    const name = parts.pop()!;
    const dir = this.#root.findDir(parts);
    const file = await dir.getOrCreateFile(name, content);
  }

  // #watchers = new Map<string, Listener<string>>();

  watchTree(path: string, fn: (content: string) => void) {
    // let watcher = this.#watchers.get(path);
    // if (!watcher) this.#watchers.set(path, watcher = new Listener());
    // return watcher.watch(fn);
  }

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

await fs.mkdirp('user/foo/bar');
