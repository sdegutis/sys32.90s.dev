import { Border } from "../../os/containers/border.js";
import { GroupX, GroupY } from "../../os/containers/group.js";
import { PanedYA } from "../../os/containers/paned.js";
import { Scroll } from "../../os/containers/scroll.js";
import { SplitX } from "../../os/containers/split.js";
import { Button } from "../../os/controls/button.js";
import { ImageView } from "../../os/controls/image.js";
import { Label } from "../../os/controls/label.js";
import { Bitmap } from "../../os/core/bitmap.js";
import { fs } from "../../os/core/fs.js";
import { Panel } from "../../os/core/panel.js";
import { $ } from "../../os/core/view.js";
import { ws } from "../../os/desktop/workspace.js";
import { showPrompt } from "../../os/util/dialog.js";
import { showMenu } from "../../os/util/menu.js";


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

  const breadcrumbs = $(GroupX, { align: 'a', gap: 1, background: 0x00000099 });

  const mountButton = $(Button, {
    padding: 2,
    background: 0x99000099,
    onClick: async () => {
      const drive = await showPrompt('what shall the name be?');
      if (!drive || fs.drives().includes(drive)) return;

      let folder: FileSystemDirectoryHandle;
      try {
        folder = await window.showDirectoryPicker();

        await folder.requestPermission({ mode: 'readwrite' });
        await fs.mount(drive, folder);

        addDriveButton(drive);

        panel.layoutTree();
      }
      catch { }

    }
  }, $(Label, { text: 'mount' }));

  sidelist.addChild(mountButton);

  async function showfiles(base: string[]) {
    const dir = fs.getFolder(base.join('/'));

    breadcrumbs.children = base.map((name, i) => {
      return $(Button, {
        padding: 2,
        onClick: () => { showfiles(base.slice(0, i + 1)) }
      }, $(Label, { text: name }));
    });
    breadcrumbs.parent?.layoutTree();

    filelist.children = [
      ...dir.folders.map(file => {
        return $(Button, {
          padding: 2, onClick: () => {
            showfiles([...base, file.name]);
          }
        },
          $(GroupX, { passthrough: true, gap: 2 },
            $(ImageView, { image: folderIcon }),
            $(Label, { text: file.name }),
          )
        );
      }),
      ...dir.files.map(file => {
        return $(Button, {
          padding: 2, onClick: (click) => {
            if (click.button === 0 && click.count > 1) {
              ws.openFile([...base, file.name].join('/'));
            }
          }
        },
          $(GroupX, { passthrough: true, gap: 2 },
            $(ImageView, { image: fileIcon }),
            $(Label, { text: file.name }),
          )
        );
      }),
    ];

    if (filelist.children.length === 0) {
      filelist.children = [$(Border, { padding: 2 }, $(Label, { text: '[empty]', color: 0xffffff77 }))];
    }

    filelist.layoutTree();
  }

  function addDriveButton(drive: string) {
    const driveButton = $(Button, {
      padding: 2,
      background: 0xff000033,
      onClick: (click) => {
        if (click.button === 0) {
          showfiles([drive]);
        }
        else {
          showMenu([
            {
              text: 'unmount',
              onClick: () => {
                fs.unmount(drive)
                driveButton.remove();
                sidelist.layoutTree();
              },
            },
          ]);
        }
      },
    },
      $(Label, { text: `drive:${drive}` })
    );

    sidelist.addChild(driveButton, sidelist.children.indexOf(mountButton));
    sidelist.parent?.layoutTree();
  }

  for (const drive of fs.drives()) {
    addDriveButton(drive);
  }

  const panel = $(Panel, { title: 'filer', w: 150, h: 100, },
    $(SplitX, { background: 0xffffff11, pos: 50, resizable: true, dividerColor: 0x33333300 },
      $(Scroll, { w: 40, background: 0x00000077, }, sidelist),
      $(PanedYA, {},
        breadcrumbs,
        $(Scroll, {}, filelist),
      )
    )
  )
  panel.show();

};
