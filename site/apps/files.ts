import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedXA, PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { TextField } from "../sys32/controls/textfield.js";
import { System } from "../sys32/core/system.js";
import { Panel } from "../sys32/desktop/panel.js";



export default (sys: System) => {
  const mountLabel = sys.make(TextField, { length: 2, background: 0xffffff11 });
  const toolbar = sys.make(GroupX, {},
    mountLabel,
    sys.make(Button, { onClick: mountNew }, sys.make(Label, { text: 'mount' }))
  );

  // (async () => {
  //   // console.log(await sys.fs.getFolder('b'))
  //   // // await sys.fs.#drives['b'].putFile('foo', 'bar')
  //   // // await sys.fs.#drives['b'].putFolder('qux')
  //   // const b = await sys.fs.getFolder('b');
  //   // await b!.putFolder('qux')
  //   // await sys.fs.saveFile('b/qux/hmm3', 'bar123es')
  //   // // console.log(await sys.fs.loadFile('b/qux/hmm'))
  //   const dir = await (await sys.fs.getFolder('b/qux'))?.list() ?? [];
  //   for (const f of dir) {
  //     console.log(f);
  //   }

  // })()

  const sidelist = sys.make(GroupY, { gap: 1 });
  const filelist = sys.make(GroupY, {});

  sys.fs.drives.then(drives => {
    for (const key of Object.keys(drives)) {
      sidelist.addChild(sys.make(Button, {
        background: 0x11111111,
        onClick: async () => {
          console.log(key)

          const sub = await sys.fs.getFolder(key);
          const list = await sub?.list();

          console.log(list)

          // filelist.children = 
        }
      },
        sys.make(Border, { all: 2, background: 0xff000033, },
          sys.make(Label, { text: `drive: ${key}` })
        )
      ));
      sidelist.parent?.layoutTree();
    }
  });

  const panel = sys.make(Panel, { title: 'files', w: 150, h: 100, },
    sys.make(PanedYB, { gap: 2 },
      sys.make(PanedXA, { background: 0xffffff11 },
        sys.make(Scroll, { w: 40, background: 0x00000077, }, sidelist),
        sys.make(Scroll, {}, filelist),
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
