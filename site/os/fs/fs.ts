import { opendb } from "./db.js";
import { type Drive } from "./interface.js";
import { SysDrive } from "./sys.js";
import { UserDrive } from "./user.js";

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
    return root.drives.keys().map(s => s + '/').toArray();
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

  getFolder(path: string) {
    const [drive, subpath] = prepare(path);
    const r = new RegExp(`^${subpath}.+?(/|$)`);
    return (drive.items
      .entries()
      .map(([k, v]) => {

        // if (v.)

        const m = k.match(r)?.[0];
        if (!m) return null;
        const name = m.slice(subpath.length);
        if (m.endsWith('/')) return {
          name,
          type: 'folder' as const,
        };
        return {
          name,
          type: 'file' as const,
          content: v,
        };
      })
      .filter(e => e !== null)
      .toArray()
      .sort(sortBy(e => (e.type === 'folder' ? 0 : 1) + e.name)));
  }

  loadFile(path: string): string | undefined {
    const [drive, subpath] = prepare(path);
    const item = drive.items.get(subpath);
    if (item?.type === 'file') return item.content;
    return undefined;
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

function prepare(fullpath: string) {
  const parts = fullpath.split('/');
  const drivename = parts.shift()!;
  const drive = root.drives.get(drivename)!;
  return [drive, parts.join('/')] as const;
}

export const fs = new FS();

await root.addDrive('sys', new SysDrive());
await root.addDrive('user', new UserDrive());
// for (const { drive, dir } of await mounts.all()) {
//   await root.addDrive(new MountedDrive(drive, dir));
// }

// await fs.mkdirp('user/foo/bar');
