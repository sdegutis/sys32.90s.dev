import { Border } from "../../sys32/containers/border.js";
import { GroupX, GroupY } from "../../sys32/containers/group.js";
import { PanedYB } from "../../sys32/containers/paned.js";
import { Scroll } from "../../sys32/containers/scroll.js";
import { SplitX } from "../../sys32/containers/split.js";
import { Button } from "../../sys32/controls/button.js";
import { ImageView } from "../../sys32/controls/image.js";
import { Label } from "../../sys32/controls/label.js";
import { TextField } from "../../sys32/controls/textfield.js";
import { Bitmap } from "../../sys32/core/bitmap.js";
import { fs, type Folder } from "../../sys32/core/fs.js";
import { sys } from "../../sys32/core/system.js";
import { $, View } from "../../sys32/core/view.js";
import { Panel } from "../../sys32/desktop/panel.js";
import { centerLayout } from "../../sys32/util/layouts.js";
import { passedFocus } from "../../sys32/util/unsure.js";
import fontmaker from "../fontmaker/fontmaker.js";
import painter from "../painter/painter.js";


const folderIcon = new Bitmap([0x990000ff], 1, [1]);
const fileIcon = new Bitmap([0x000099ff], 1, [1]);


export default () => {

  // (async () => {
  //   console.log(await fs.getFolder('user'))
  //   // await fs.#drives['b'].putFile('foo', 'bar')
  //   // await fs.#drives['b'].putFolder('qux')
  //   const b = await fs.getFolder('user');
  //   await b!.putFolder('qux')
  //   await fs.saveFile('user/qux/hmm3', 'bar123es')
  //   // console.log(await fs.loadFile('b/qux/hmm'))
  //   const dir = await (await fs.getFolder('user/qux'))?.list() ?? [];
  //   for (const f of dir) {
  //     console.log(f);
  //   }

  // })()

  const sidelist = $(GroupY, { align: 'a', gap: 1 });
  const filelist = $(GroupY, { align: 'a' });

  async function showPrompt(text: string) {
    const p = Promise.withResolvers<string>();

    function expandToFitContainer(this: View) {
      this.x = 0;
      this.y = 0;
      this.w = this.parent!.w;
      this.h = this.parent!.h;
    }

    const dialog = $(View, {
      adjust: expandToFitContainer,
      layout: centerLayout,
      background: 0x00000033,
      onKeyDown(key) {
        if (key === 'Escape') {
          cancel();
          return true;
        }
        return false;
      }
    },
      $(Border, { all: 1, borderColor: 0x99000099, passthrough: false },
        $(Border, { all: 3, background: 0x000000ff },
          $(GroupY, { gap: 3, align: 'a', },
            $(Label, { text }),
            $(Border, { all: 2, background: 0x222222ff, ...passedFocus },
              $(TextField, { id: 'field', onEnter: accept, })
            ),
            $(GroupX, { gap: 2 },
              $(Button, { all: 3, onClick: accept }, $(Label, { text: 'ok' })),
              $(Button, { all: 3, onClick: cancel }, $(Label, { text: 'cancel' })),
            )
          )
        )
      )
    );

    function accept() { p.resolve(dialog.find<TextField>('field')!.text); }
    function cancel() { p.resolve(''); }

    sys.root.addChild(dialog);
    dialog.find('field')!.focus();
    dialog.layoutTree();

    p.promise.then(() => dialog.remove());

    return p.promise;
  }

  const mountButton = $(Button, {
    all: 3,
    onClick: async () => {
      const drive = await showPrompt('what shall the name be?');
      if (!drive) return;
      try {
        const folder = await window.showDirectoryPicker();
        await folder.requestPermission({ mode: 'readwrite' });
        await fs.mountUserFolder(drive, folder);
      }
      catch { }
      // TODO: add to sidebar...
      panel.layoutTree();
    }
  }, $(Label, { text: 'mount' }));

  sidelist.addChild(mountButton);

  function sortBy<T, U>(fn: (o: T) => U) {
    return (a: T, b: T) => {
      const aa = fn(a);
      const bb = fn(b);
      if (aa < bb) return -1;
      if (aa > bb) return +1;
      return 0;
    };
  }

  async function showfiles(folder: Folder) {
    const files = await folder?.list();

    console.log(folder.path);

    files.sort(sortBy(f => (f.kind === 'folder' ? 1 : 2) + f.name));

    filelist.children = files.map(file => {
      return $(Button, {
        all: 2, onClick: () => {

          if (file.kind === 'folder') {
            folder.getFolder(file.name).then(folder => {
              showfiles(folder!);
            })
          }
          else {
            if (file.name.endsWith('.bitmap')) {
              painter(folder.path + file.name);
            }
            if (file.name.endsWith('.font')) {
              fontmaker(folder.path + file.name);
            }
          }

          console.log('clicked', file)
        }
      },
        $(GroupX, { passthrough: true, gap: 2 },
          $(ImageView, { image: file.kind === 'file' ? fileIcon : folderIcon }),
          $(Label, { text: file.name }),
        )
      );
    });

    filelist.layoutTree();
  }

  for (const key of Object.keys(fs.drives)) {
    sidelist.addChild($(Button, {
      all: 2, background: 0xff000033, onClick: async () => {
        showfiles((await fs.getFolder(key))!);
      }
    },
      $(Label, { text: `drive:${key}` })
    ), sidelist.children.indexOf(mountButton));
    sidelist.parent?.layoutTree();
  }

  const panel = $(Panel, { title: 'filer', w: 150, h: 100, },
    $(SplitX, { background: 0xffffff11, pos: 50, resizable: true, dividerColor: 0x33333300 },
      $(Scroll, { w: 40, background: 0x00000077, }, sidelist),
      $(Scroll, {}, filelist),
    )
  )
  sys.root.addChild(panel);
  panel.focus();


};
