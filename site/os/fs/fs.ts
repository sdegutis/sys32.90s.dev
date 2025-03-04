import { Folder, type Drive } from "./base.js";
import { opendb } from "./db.js";
import { MountedDrive } from "./mount.js";
import { SysDrive } from "./sys.js";
import { UserDrive } from "./user.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');


class Root extends Folder {

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
    let node: Folder = this.#root;
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

export const fs = new FS();
await fs.init();

await fs.mkdirp('user/foo/bar');
