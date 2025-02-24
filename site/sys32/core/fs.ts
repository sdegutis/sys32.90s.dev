interface Folder {

  items: Record<string, Folder | string>;
  parent?: Folder;

}

class MemoryFolder implements Folder {

  items = {};

  constructor() {

    // type JsonFile = {
    //   path: string;
    //   content: string;
    // };

    // (fetch(import.meta.resolve('./files.json'))
    //   .then<JsonFile[]>(res => res.json())
    //   .then(json => {
    //     console.log(json[0].path)
    //     console.log(json[0].content)
    //   }));
  }

}

class LocalStorageFolder implements Folder {

  items = {};

}

class IndexedDbFolder implements Folder {

  items = {};

}

class UserFolder implements Folder {

  items = {};

}

export class FS {

  drives: Record<string, Folder> = {
    a: new MemoryFolder(),
    b: new LocalStorageFolder(),
    c: new IndexedDbFolder(),
  };

  constructor() {
    this.#remountUserDrives();
  }

  #remountUserDrives() {

  }

}
