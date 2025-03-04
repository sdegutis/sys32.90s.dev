import { Listener } from "../util/events.js";
import { opendb } from "./db.js";
import { type Drive, type DriveNotificationType } from "./drive.js";
import { MountedDrive } from "./mount.js";
import { SysDrive } from "./sys.js";
import { UserDrive } from "./user.js";

const mounts = await opendb<{ drive: string, dir: FileSystemDirectoryHandle }>('mounts', 'drive');
const drives = new Map<string, Drive>();
const watchers = new Map<string, Listener<DriveNotificationType>>();

class FS {

  async mount(drive: string, folder: FileSystemDirectoryHandle) {
    mounts.set({ drive, dir: folder });
    await addDrive(drive, new MountedDrive(folder));
  }

  unmount(drive: string) {
    mounts.del(drive);
    removeDrive(drive);
  }

  drives() {
    return drives.keys().map(s => s + '/').toArray();
  }

  async mkdirp(path: string) {
    if (path.endsWith('/')) path = path.replace(/\/+$/, '');

    const [drive, subpath] = prepare(path);
    const parts = subpath.split('/');

    for (let i = 0; i < parts.length; i++) {
      const dir = parts.slice(0, i + 1).join('/') + '/';
      await drive.putdir(dir);
    }
  }

  async rm(path: string) {
    const [drive, subpath] = prepare(path);
    await drive.rmfile(subpath);
  }

  async rmdir(path: string) {
    if (!path.endsWith('/')) path += '/';
    const [drive, subpath] = prepare(path);
    await drive.rmdir(subpath);
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
    if (item?.type === 'file') return normalize(item.content);
    return undefined;
  }

  async saveFile(filepath: string, content: string) {
    const [drive, subpath] = prepare(filepath);
    drive.putfile(subpath, normalize(content));
  }

  watchTree(path: string, fn: (type: DriveNotificationType) => void) {
    let watcher = watchers.get(path);
    if (!watcher) watchers.set(path, watcher = new Listener());
    return watcher.watch(fn);
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

function notify(type: DriveNotificationType, path: string) {
  for (const [p, w] of watchers) {
    if (path.startsWith(p)) {
      w.dispatch(type);
    }
  }
}

async function addDrive(name: string, drive: Drive) {
  await drive.mount((type, path) => notify(type, name + '/' + path));
  drives.set(name, drive);
}

function removeDrive(name: string) {
  if (name === 'sys' || name === 'user') return;
  drives.get(name)?.unmount?.();
  drives.delete(name);
}

function normalize(content: string) {
  return content.replace(/\r\n/g, '\n');
}

export const fs = new FS();

await addDrive('sys', new SysDrive());
await addDrive('user', new UserDrive());
for (const { drive, dir } of await mounts.all()) {
  await addDrive(drive, new MountedDrive(dir));
}
