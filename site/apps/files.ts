import { GroupX } from "../sys32/containers/group.js";
import { PanedXA, PanedYB } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";


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

  const mountNew = async () => {
    const folder = await window.showDirectoryPicker();
    await folder.requestPermission({ mode: 'readwrite' });
    await sys.fs.mountUserFolder('d', folder);
    console.log(await sys.fs.getFolder('d'))
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
