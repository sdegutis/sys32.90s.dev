import { opendb } from "./db.js";
import { type Drive } from "./interface.js";
import { SysDrive } from "./sys.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');

class Root {

  drives = new Map<string, Drive>();

  async addDrive(name: string, drive: Drive) {
    await drive.init();
    this.drives.set(name, drive);
  }

  removeDrive(name: string) {
    if (name === 'sys' || name === 'user') return;
    const drive = this.drives.get(name);
    this.drives.delete(name);
    drive?.deinit?.();
  }

}

const root = new Root();


class FS {

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    console.log('mount')
    mounts.set({ drive, dir: folder });
    // await root.addDrive(new MountedDrive(drive, folder));
  }

  unmount(drive: string) {
    console.log('unmount')
    mounts.del(drive);
    root.removeDrive(drive);
  }

  drives() {
    console.log('drives')
    return [] as string[];
    // return root.items.map(f => f.name);
  }

  async mkdirp(path: string) {
    // let node: Folder = root;
    // const parts = path.split('/');
    // while (parts.length > 0) {
    //   const name = parts.shift()!;
    //   node = await node.getOrCreateFolder(name);
    // }
    // return node;
  }

  getFolder(path: string): { folders: { name: string }[], files: { name: string }[] } {
    console.log('getFolder')
    return {
      folders: [],
      files: [],
    };
    // return root.findDir(path.split('/'));
  }

  loadFile(path: string): string | undefined {
    const [drive, subpath] = prepare(path);
    return drive.items.get(subpath)?.content;
  }

  async saveFile(filepath: string, content: string) {
    console.log('saveFile', filepath)
    // const parts = filepath.split('/');
    // const name = parts.pop()!;
    // const dir = root.findDir(parts);
    // const file = await dir.getOrCreateFile(name, content);
  }

  // #watchers = new Map<string, Listener<string>>();

  watchTree(path: string, fn: (content: string) => void) {
    console.log('watchTree', path)
    // let watcher = this.#watchers.get(path);
    // if (!watcher) this.#watchers.set(path, watcher = new Listener());
    // return watcher.watch(fn);
  }

}

function prepare(fullpath: string) {
  const parts = fullpath.split('/');
  const drivename = parts.shift()!;
  const drive = root.drives.get(drivename)!;
  return [drive, parts.join('/')] as const;
}

export const fs = new FS();

await root.addDrive('sys', new SysDrive());
// await root.addDrive(new UserDrive('user'));
// for (const { drive, dir } of await mounts.all()) {
//   await root.addDrive(new MountedDrive(drive, dir));
// }

// await fs.mkdirp('user/foo/bar');
