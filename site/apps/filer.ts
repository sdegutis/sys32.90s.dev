import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { SplitX } from "../sys32/containers/split.js";
import { Button } from "../sys32/controls/button.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { fs, type Folder } from "../sys32/core/fs.js";
import { sys } from "../sys32/core/system.js";
import { $ } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { passedFocus } from "../sys32/util/unsure.js";
import fontmaker from "./fontmaker.js";
import painter from "./painter.js";


const folderIcon = new Bitmap([0x990000ff], 1, [1]);
const fileIcon = new Bitmap([0x000099ff], 1, [1]);


export default () => {

  const mountLabel = $(TextField, { length: 2, onEnter: mountNew });
  const toolbar = $(GroupX, {},
    $(Border, { all: 1, ...passedFocus, background: 0xffffff11 },
      mountLabel
    )
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

  const sidelist = $(GroupY, { gap: 1 });
  const filelist = $(GroupY, { align: 'a' });

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

  fs.drives.then(drives => {
    for (const key of Object.keys(drives)) {
      sidelist.addChild($(Button, {
        all: 2, background: 0xff000033, onClick: async () => {
          showfiles((await fs.getFolder(key))!);
        }
      },
        $(Label, { text: `drive: ${key}` })
      ));
      sidelist.parent?.layoutTree();
    }
  });

  const panel = $(Panel, { title: 'files', w: 150, h: 100, },
    $(PanedYB, { gap: 2 },
      $(SplitX, { background: 0xffffff11, pos: 40, resizable: true, dividerColor: 0x33333300 },
        $(Scroll, { w: 40, background: 0x00000077, }, sidelist),
        $(Scroll, {}, filelist),
      ),
      toolbar,
    )
  )
  sys.root.addChild(panel);
  panel.focus();


  async function mountNew() {
    const drive = mountLabel.text;
    mountLabel.text = '';

    const folder = await window.showDirectoryPicker();
    await folder.requestPermission({ mode: 'readwrite' });
    await fs.mountUserFolder(drive, folder);
  }

};
