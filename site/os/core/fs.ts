import { Listener } from "../util/events.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const idbfs = await opendb<{ path: string, content: string }>('idbfs', 'path');

type FileChanged = (path: string, content: string) => void;

interface Drive {
  init(addFile: FileChanged): Promise<void>;
  push(path: string, content: string): void;
}

class SysDrive implements Drive {

  async init(addFile: FileChanged) {
    const files = await fetch(import.meta.resolve('./data.json')).then(r => r.json());
    for (const file of files) {
      const data = await fetch(file).then(r => r.text());
      const path = file.slice('/os/data'.length);
      addFile(path, data);
    }
  }

  push(path: string, content: string): void { }

}

class UserDrive implements Drive {

  async init(addFile: FileChanged) {
    for (const { path, content } of await idbfs.all()) {
      addFile(path, content);
    }
  }

  push(path: string, content: string): void {
    idbfs.set({ path, content });
  }

}

class MountedDrive implements Drive {

  root: FileSystemDirectoryHandle;
  // dhs = new Map<string, FileSystemDirectoryHandle>();
  // fhs = new Map<string, FileSystemFileHandle>();

  changed: (change: FileSystemObserverRecord) => void;

  constructor(dir: FileSystemDirectoryHandle, changed: (change: FileSystemObserverRecord) => void) {
    this.root = dir;
    this.changed = changed;
  }

  async init(addFile: FileChanged) {
    await this.#loaddir(this.root, '/', addFile);

    const observer = new FileSystemObserver((records) => {
      for (const change of records) {
        const path = '/' + change.relativePathComponents.join('/');

        // console.log(change.root)

        if (change.type === 'appeared') {
          if (change.changedHandle instanceof FileSystemDirectoryHandle) {
            // change.changedHandle.
          }
          else {
            // change.changedHandle.
          }
        }
        else if (change.type === 'disappeared') {

        }
        else if (change.type === 'modified') {

        }
        else if (change.type === 'moved') {
          // rename
        }
        else if (change.type === 'errored') {

        }
        else if (change.type === 'unknown') {

        }

        // this.changed(change);
      }

    });
    observer.observe(this.root, { recursive: true });
  }

  async #loaddir(dir: FileSystemDirectoryHandle, path: string, addFile: FileChanged) {
    // this.dhs.set(path, dir);

    for await (const [name, entry] of dir.entries()) {
      if (entry.kind === 'directory') {
        await this.#loaddir(entry, `${path}${name}/`, addFile)
      }
      else {
        const fullpath = `${path}${name}`;
        // this.fhs.set(fullpath, entry);

        const h = await dir.getFileHandle(name);
        const f = await h.getFile();
        const data = await f.text();

        addFile(fullpath, data);
      }
    }
  }

  async push(path: string, content: string) {
    // const h = await this.#dir.getFileHandle(name, { create: true });
    // const w = await h.createWritable();
    // await w.write(content);
    // await w.close();
  }

}

export type Folder = {
  name: string;
  folders: Folder[];
  files: { name: string, content: string }[];
};

class FS {

  #root: Folder = { name: '[root]', folders: [], files: [] };

  #drives: Record<string, Drive> = {
    sys: new SysDrive(),
    user: new UserDrive(),
  };

  async init() {
    for (const [name, drive] of Object.entries(this.#drives)) {
      this.#root.folders.push({ files: [], folders: [], name });
      await drive.init(this.#addfile.bind(this, name));
    }
    for (const { drive, dir } of await mounts.all()) {
      await this.mountUserFolder(drive, dir);
    }
  }

  unmountUserFolder(drive: string) {
    if (drive === 'sys' || drive === 'user') return false;

    mounts.del(drive);

    return true;
  }

  async mountUserFolder(drive: string, folder: FileSystemDirectoryHandle) {
    if (drive in this.#drives) return;

    this.#root.folders.push({ files: [], folders: [], name: drive });

    mounts.set({ drive, dir: folder });

    const mounted = new MountedDrive(folder, (change) => {
      this.#reflectChanges(drive, change);
    });

    this.#drives[drive] = mounted;

    await mounted.init(this.#addfile.bind(this, drive));
  }

  #reflectChanges(drive: string, change: FileSystemObserverRecord) {
    const parts = [drive, ...change.relativePathComponents];

    if (change.type === 'appeared') {
      // change.
    }
    else if (change.type === 'disappeared') {

    }
    else if (change.type === 'errored') {

    }
    else if (change.type === 'modified') {

    }
    else if (change.type === 'moved') {

    }
    else if (change.type === 'unknown') {

    }

    console.log(change.type, change.relativePathComponents, change.changedHandle)

    // const file = parts.pop()!;
    // const dir = this.#nav(parts);



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
    return Object.keys(this.#drives);
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

  // #split<T>(fullpath: string) {
  //   const i = fullpath.indexOf('/');
  //   const drivename = fullpath.slice(0, i);
  //   const drivepath = fullpath.slice(i);
  //   return [this.#drives[drivename], drivepath] as const;
  // }

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
