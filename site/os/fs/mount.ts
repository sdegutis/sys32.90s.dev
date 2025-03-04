// import { Folder, StringFile, type Drive } from "./interface.js";

import type { Drive, DriveFile, DriveFolder, DriveItem } from "./interface.js";

// class MountedFolder extends Folder implements Drive {

//   handle: FileSystemDirectoryHandle;

//   override items: (MountedFolder | MountedFile)[] = [];

//   constructor(name: string, handle: FileSystemDirectoryHandle) {
//     super(name);
//     this.handle = handle;
//   }

//   async init() {
//     for await (const [name, handle] of this.handle.entries()) {
//       await this.addentry(name, handle);
//     }
//   }

//   async addentry(name: string, handle: FileSystemDirectoryHandle | FileSystemFileHandle) {
//     const item = this.items.find(it => it.name === name);
//     if (item) {
//       item.handle = handle;
//       return;
//     }

//     if (handle instanceof FileSystemDirectoryHandle) {
//       const dir = new MountedFolder(name, handle);
//       await dir.init();
//       this.add(dir);
//     }
//     else {
//       const file = new MountedFile(name, handle);
//       await file.pull();
//       this.add(file);
//     }
//   }

//   override async makeFolder(name: string) {
//     const handle = await this.handle.getDirectoryHandle(name, { create: true });
//     return new MountedFolder(name, handle);
//   }

//   override async makeFile(name: string): Promise<MountedFile> {
//     const handle = await this.handle.getFileHandle(name, { create: true });
//     return new MountedFile(name, handle);
//   }

// }

// class MountedFile extends StringFile {

//   handle: FileSystemFileHandle;

//   constructor(name: string, handle: FileSystemFileHandle) {
//     super(name, '');
//     this.handle = handle;
//   }

//   async pull() {
//     const f = await this.handle.getFile();
//     this.content = await f.text();
//   }

//   override async push() {
//     const w = await this.handle.createWritable();
//     await w.write(this.content);
//     await w.close();
//   }

// }

type MountedFile = DriveFile & {
  handle: FileSystemFileHandle;
};

type MountedFolder = DriveFolder & {
  handle: FileSystemDirectoryHandle;
};

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
          // await this.#handleChange(change);
        }
      });
    });
    this.observer.observe(root, { recursive: true });
  }

  async init() {
    await this.addfrom('', this.root);
  }

  async addfrom(path: string, dir: FileSystemDirectoryHandle) {
    for await (const [name, handle] of dir.entries()) {
      let fullpath = path + name;
      if (handle instanceof FileSystemDirectoryHandle) {
        fullpath += '/';

        this.items.set(fullpath, { type: 'folder', handle });
        this.addfrom(fullpath, handle);
      }
      else {
        const f = await handle.getFile();
        const content = await f.text();
        this.items.set(fullpath, { type: 'file', handle, content });
      }
    }
  }

  async mkdir(path: string) {
  }

  deinit(): void {
    this.observer.disconnect();
  }

  // async #handleChange(change: FileSystemObserverRecord) {
  //   if (change.type === 'unknown') {
  //     console.warn('unknown fs event', change);
  //     return;
  //   }

  //   if (change.type === 'moved') {
  //     const parts = [...change.relativePathMovedFrom];
  //     const name = parts.pop()!;
  //     const dir = this.findDir(parts);
  //     const f = dir.items.find(f => f.name === name)!;

  //     f.handle = change.changedHandle;
  //     f.name = change.relativePathComponents.at(-1)!;
  //     return;
  //   }

  //   const parts = [...change.relativePathComponents];
  //   const name = parts.pop()!;
  //   const dir = this.findDir(parts);

  //   if (change.type === 'appeared') {
  //     await dir.addentry(name, change.changedHandle);
  //     return;
  //   }

  //   if (change.type === 'modified') {
  //     const file = dir.getFile(name) as MountedFile;
  //     await file.pull();
  //     return;
  //   }

  //   if (change.type === 'disappeared' || change.type === 'errored') {
  //     dir.del(name);
  //     return;
  //   }
  // }

}
