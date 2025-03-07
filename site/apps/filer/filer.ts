import { Border } from "../../os/containers/border.js";
import { GroupX, GroupY } from "../../os/containers/group.js";
import { PanedYA } from "../../os/containers/paned.js";
import { Scroll } from "../../os/containers/scroll.js";
import { SplitX } from "../../os/containers/split.js";
import { Button } from "../../os/controls/button.js";
import { ImageView } from "../../os/controls/image.js";
import { Label } from "../../os/controls/label.js";
import { Bitmap } from "../../os/core/bitmap.js";
import { Panel } from "../../os/desktop/panel.js";
import { sys } from "../../os/core/system.js";
import { $ } from "../../os/core/view.js";
import { ws } from "../../os/desktop/workspace.js";
import { fs } from "../../os/fs/fs.js";
import { showConfirm, showPrompt } from "../../os/util/dialog.js";
import { showMenu } from "../../os/util/menu.js";


const folderIcon = new Bitmap([0x990000ff], 1, [1]);
const fileIcon = new Bitmap([0x000099ff], 1, [1]);


export default () => {

  let currentBase: string[] = ['user/'];

  const sidelist = $(GroupY, { align: 'a', gap: 1 });
  const filelist = $(GroupY, { align: 'a' });

  const breadcrumbs = $(GroupX, { align: 'a', background: 0x00000099 });

  const mountButton = $(Button, {
    padding: 2,
    background: 0x99000099,
    onClick: async () => {
      const drive = await showPrompt('what shall the name be?');
      if (!drive || fs.drives().includes(drive)) return;

      try {
        const folder = await window.showDirectoryPicker();
        await folder.requestPermission({ mode: 'readwrite' });
        await fs.mount(drive, folder);
        addDriveButton(drive);
        sys.layoutTree(panel);
      }
      catch { }
    }
  }, $(Label, { text: 'mount' }));

  sidelist.addChild(mountButton);

  const mkdirButton = $(Button, {
    padding: 2,
    background: 0x99000099,
    onClick: async () => {
      const name = await showPrompt('what shall the name be?');
      if (!name || fs.drives().includes(name)) return;
      await fs.mkdirp([...currentBase, name].join(''));
      showfiles();
      sys.layoutTree(panel);
    }
  }, $(Label, { text: 'new folder' }));

  sidelist.addChild(mkdirButton);

  async function showfiles() {
    const base = currentBase;

    const dir = fs.list(base.join(''));

    const folders = dir.filter(e => e.type === 'folder');
    const files = dir.filter(e => e.type === 'file');

    breadcrumbs.children = base.map((name, i) => {
      return $(Button, {
        padding: 2,
        onClick: () => {
          currentBase = base.slice(0, i + 1);
          showfiles();
        }
      }, $(Label, { text: name }));
    });
    sys.layoutTree(breadcrumbs.parent!);

    filelist.children = [
      ...folders.map(file => {
        return $(Button, {
          padding: 2, onClick: (click) => {
            if (click.button > 1) {
              showMenu([{
                text: 'delete',
                onClick: async () => {
                  if (!(await showConfirm('are you sure?'))) return;
                  await fs.rmdir([...base, file.name].join(''));
                  showfiles();
                  sys.layoutTree(sidelist);
                },
              },
              ])
              return;
            }

            currentBase = [...base, file.name];
            showfiles();
          }
        },
          $(GroupX, { passthrough: true, gap: 2 },
            $(ImageView, { image: folderIcon }),
            $(Label, { text: file.name }),
          )
        );
      }),
      ...files.map(file => {
        return $(Button, {
          padding: 2, onClick: (click) => {
            if (click.button > 1) {
              showMenu([{
                text: 'delete',
                onClick: async () => {
                  if (!(await showConfirm('are you sure?'))) return;
                  await fs.rm([...base, file.name].join(''));
                  showfiles();
                  sys.layoutTree(sidelist);
                },
              },
              ])
              return;
            }

            if (click.button === 0 && click.count > 1) {
              ws.openFile([...base, file.name].join(''));
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

    sys.layoutTree(filelist);
  }

  function addDriveButton(drive: string) {
    const driveButton = $(Button, {
      padding: 2,
      background: 0xff000033,
      onClick: (click) => {
        if (click.button === 0) {
          currentBase = [drive];
          showfiles();
        }
        else {
          showMenu([
            {
              text: 'unmount',
              onClick: () => {
                fs.unmount(drive)
                driveButton.remove();
                sys.layoutTree(sidelist);
              },
            },
          ]);
        }
      },
    },
      $(Label, { text: `drive:${drive}` })
    );

    sidelist.addChild(driveButton, sidelist.children.indexOf(mountButton));
    sys.layoutTree(sidelist.parent);
  }

  for (const drive of fs.drives()) {
    addDriveButton(drive);
  }

  showfiles();

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
