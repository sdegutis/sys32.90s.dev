import type { Drive, DriveFile, DriveFolder, DriveItem } from "./drive.js";

type MountedFile = DriveFile & { handle: FileSystemFileHandle };
type MountedFolder = DriveFolder & { handle: FileSystemDirectoryHandle };
type MountedItem = MountedFile | MountedFolder;

export class MountedDrive implements Drive {

  items = new Map<string, MountedItem>();
  root: FileSystemDirectoryHandle;
  observer: FileSystemObserver;

  constructor(root: FileSystemDirectoryHandle) {
    this.root = root;

    let processChanges = Promise.resolve();
    this.observer = new FileSystemObserver(changes => {
      processChanges = processChanges.then(async () => {
        for (const change of changes) {
          await this.#handleChange(change);
        }
      });
    });
    this.observer.observe(root, { recursive: true });
  }

  async mount() {
    await this.#scan('', this.root);
  }

  async #scan(path: string, dir: FileSystemDirectoryHandle) {
    for await (const [name, handle] of dir.entries()) {
      const isdir = handle instanceof FileSystemDirectoryHandle;
      const fullpath = path + name + (isdir ? '/' : '');

      await this.#add(fullpath, handle);

      if (isdir) {
        await this.#scan(fullpath, handle);
      }
    }
  }

  async #add(path: string, handle: FileSystemDirectoryHandle | FileSystemFileHandle) {
    if (handle instanceof FileSystemDirectoryHandle) {
      this.items.set(path, { type: 'folder', handle });
    }
    else {
      const f = await handle.getFile();
      const content = await f.text();
      this.items.set(path, { type: 'file', handle, content });
    }
  }

  async putdir(path: string) {
    if (this.items.has(path)) return;
    const parts = path.split('/');

    const parentpath = parts.slice(0, -2).join('/') + '/';
    const parent = this.items.get(parentpath) as MountedFolder | undefined;
    const parenthandle = parent?.handle ?? this.root;

    const name = parts.at(-2)!;
    const handle = await parenthandle.getDirectoryHandle(name, { create: true });
    this.items.set(path, { type: 'folder', handle });
  }

  async putfile(path: string, content: string) {
    let file = this.items.get(path) as MountedFile | undefined;

    if (file) {
      file.content = content;
    }
    else {
      const parts = path.split('/');

      const parentpath = parts.slice(0, -1).join('/') + '/';
      const parent = this.items.get(parentpath) as MountedFolder | undefined;
      const parenthandle = parent?.handle ?? this.root;

      const name = parts.at(-1)!;
      const handle = await parenthandle.getFileHandle(name, { create: true });
      file = { type: 'file', content, handle };
      this.items.set(path, file);
    }

    const w = await file.handle.createWritable();
    await w.write(content);
    await w.close();
  }

  unmount(): void {
    this.observer.disconnect();
  }

  async #handleChange(change: FileSystemObserverRecord) {
    if (change.type === 'unknown') {
      console.warn('unknown fs event', change);
      return;
    }

    const isdir = change.changedHandle instanceof FileSystemDirectoryHandle;
    const end = isdir ? '/' : '';
    const path = change.relativePathComponents.join('/') + end;

    if (change.type === 'moved') {
      const oldpath = change.relativePathMovedFrom.join('/') + end;
      const item = this.items.get(oldpath)!;
      this.items.delete(oldpath);
      this.items.set(path, item);
      item.handle = change.changedHandle;
      return;
    }

    if (change.type === 'appeared') {
      await this.#add(path, change.changedHandle);
      return;
    }

    if (change.type === 'modified') {
      const item = this.items.get(path) as MountedFile;
      const f = await item.handle.getFile();
      item.content = await f.text();
      return;
    }

    if (change.type === 'disappeared' || change.type === 'errored') {
      this.items.delete(path + '/') || this.items.delete(path);
      return;
    }
  }

  async rmdir(path: string) {

  }

  async rmfile(path: string) {

  }

}
