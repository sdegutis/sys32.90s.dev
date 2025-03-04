import { opendb } from "./db.js";
import { type Drive } from "./interface.js";
import { MountedDrive } from "./mount.js";
import { SysDrive } from "./sys.js";
import { UserDrive } from "./user.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');

const drives = new Map<string, Drive>();

class FS {

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    console.log('mount')
    mounts.set({ drive, dir: folder });
    // await root.addDrive(new MountedDrive(drive, folder));
  }

  unmount(drive: string) {
    console.log('unmount')
    mounts.del(drive);
    removeDrive(drive);
  }

  drives() {
    return drives.keys().map(s => s + '/').toArray();
  }

  async mkdirp(path: string) {
    const [drive, subpath] = prepare(path);
    const parts = subpath.split('/');

    for (let i = 0; i < parts.length; i++) {
      const dir = parts.slice(0, i + 1).join('/') + '/';
      drive.mkdir(dir);
    }
  }

  getFolder(path: string) {
    const [drive, subpath] = prepare(path);
    const r = new RegExp(`^${subpath}[^/]+?/?$`);
    return (drive.items
      .entries()
      .map(([k, v]) => {
        const m = k.match(r)?.[0];
        if (!m) return null;

        const name = m.slice(subpath.length);
        const type = v.type;

        if (v.type === 'folder')
          return { name, type };
        else
          return { name, type, content: v };
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
  const drive = drives.get(drivename)!;
  return [drive, parts.join('/')] as const;
}

async function addDrive(name: string, drive: Drive) {
  await drive.init();
  drives.set(name, drive);
}

function removeDrive(name: string) {
  if (name === 'sys' || name === 'user') return;
  const drive = drives.get(name);
  drives.delete(name);
  drive?.deinit?.();
}

export const fs = new FS();

await addDrive('sys', new SysDrive());
await addDrive('user', new UserDrive());
for (const { drive, dir } of await mounts.all()) {
  await addDrive(drive, new MountedDrive(dir));
}

// await fs.mkdirp('user/foo/bar');
