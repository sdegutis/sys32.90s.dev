import { Group, GroupX } from "../sys32/containers/group.js";
import { PanedXA, PanedYA, PanedYB } from "../sys32/containers/paned.js";
import { Button, wrapButton } from "../sys32/controls/button.js";
import { Checkbox } from "../sys32/controls/checkbox.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { centerLayout } from "../sys32/util/layouts.js";


function opendb() {
  return new Promise<IDBDatabase>(res => {
    const dbopenreq = window.indexedDB.open('fs', 1);
    dbopenreq.onerror = console.log;
    dbopenreq.onupgradeneeded = () => {
      const db = dbopenreq.result;
      db.createObjectStore('mounts', { keyPath: 'drive' });
    };
    dbopenreq.onsuccess = e => {
      const db = dbopenreq.result;
      res(db);
    };
  });
}

function getdrives(db: IDBDatabase) {
  return new Promise<{ drive: string, folder: FileSystemDirectoryHandle }[]>(res => {
    const t = db.transaction('mounts', 'readonly');
    const store = t.objectStore('mounts');
    const all = store.getAll();
    all.onerror = console.log;
    all.onsuccess = (e) => res(all.result);
  });
}

function adddrive(db: IDBDatabase, drive: string, folder: FileSystemDirectoryHandle) {
  return new Promise<void>(res => {
    const t = db.transaction('mounts', 'readwrite');
    const store = t.objectStore('mounts');
    store.add({ drive, folder });
    t.onerror = console.log;
    t.oncomplete = e => res();
  });
}

export default (sys: System) => {

  let db: IDBDatabase;

  (async function () {
    db = await opendb();
    loadview();
  })();


  async function loadview() {
    const drives = await getdrives(db);
    console.log(drives)

  }



  const mountNew = async () => {
    const folder = await window.showDirectoryPicker();
    await folder.requestPermission({ mode: 'readwrite' });

    await adddrive(db, 'c', folder);
    await loadview();


  };

  const panel = sys.make(Panel, {
    title: 'files',
    w: 150, h: 100,
  },
    sys.make(PanedYB, { gap: 1 },
      sys.make(PanedXA, { background: 0xffffff11 },
        sys.make(View, { w: 40, background: 0x00003333, }),
        sys.make(View, {}),
      ),
      sys.make(GroupX, {},
        sys.make(Button, { onClick: mountNew }, sys.make(Label, { text: 'mount' }))
      ),
    )
  )
  sys.root.addChild(panel);
  sys.focus(panel);
};
