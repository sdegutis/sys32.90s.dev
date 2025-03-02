import { GroupX, GroupY } from "../../os/containers/group.js";
import { Scroll } from "../../os/containers/scroll.js";
import { SplitX } from "../../os/containers/split.js";
import { Button } from "../../os/controls/button.js";
import { ImageView } from "../../os/controls/image.js";
import { Label } from "../../os/controls/label.js";
import { Bitmap } from "../../os/core/bitmap.js";
import { fs, type FolderEntry } from "../../os/core/fs.js";
import { $ } from "../../os/core/view.js";
import { Panel } from "../../os/desktop/panel.js";
import { showPrompt } from "../../os/util/dialog.js";
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

  const mountButton = $(Button, {
    all: 3,
    onClick: async () => {
      const drive = await showPrompt('what shall the name be?');
      if (!drive) return;

      let folder: FileSystemDirectoryHandle;
      try {
        folder = await window.showDirectoryPicker();

        await folder.requestPermission({ mode: 'readwrite' });
        await fs.mountUserFolder(drive, folder);

        panel.layoutTree();
      }
      catch { }

    }
  }, $(Label, { text: 'mount' }));

  sidelist.addChild(mountButton);

  async function showfiles(files: FolderEntry[]) {
    filelist.children = files.map(file => {
      return $(Button, {
        all: 2, onClick: () => {

          // if (file.kind === 'folder') {
          //   folder.getFolder(file.name).then(folder => {
          //     showfiles(folder!);
          //   })
          // }
          // else {
          //   if (file.name.endsWith('.bitmap')) {
          //     painter(folder.path + file.name);
          //   }
          //   if (file.name.endsWith('.font')) {
          //     fontmaker(folder.path + file.name);
          //   }
          // }

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

  for (const key of fs.drives()) {
    sidelist.addChild($(Button, {
      all: 2, background: 0xff000033, onClick: async () => {
        showfiles(fs.list(key + '/')!);
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
  panel.show();


};
