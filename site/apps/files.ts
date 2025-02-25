import { GroupX } from "../sys32/containers/group.js";
import { PanedXA, PanedYB } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { TextField } from "../sys32/controls/textfield.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";


export default (sys: System) => {
  const mountLabel = sys.make(TextField, { length: 2, background: 0xffffff11 });
  const toolbar = sys.make(GroupX, {},
    mountLabel,
    sys.make(Button, { onClick: mountNew }, sys.make(Label, { text: 'mount' }))
  );

  const panel = sys.make(Panel, {
    title: 'files',
    w: 150, h: 100,
  },
    sys.make(PanedYB, { gap: 2 },
      sys.make(PanedXA, { background: 0xffffff11 },
        sys.make(View, { w: 40, background: 0x00003333, }),
        sys.make(View, {}),
      ),
      toolbar,
    )
  )
  sys.root.addChild(panel);
  sys.focus(panel);


  async function mountNew() {
    const drive = mountLabel.text;
    mountLabel.text = '';

    const folder = await window.showDirectoryPicker();
    await folder.requestPermission({ mode: 'readwrite' });
    await sys.fs.mountUserFolder(drive, folder);
  }

};
