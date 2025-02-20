import { demo } from "./demo.js";
import mapmaker from "./mapmaker.js";
import { Group, Spaced } from "./sys32/containers/group.js";
import { centerLayout, makeVacuumLayout } from "./sys32/containers/layouts.js";
import { Paned } from "./sys32/containers/paned.js";
import { Button } from "./sys32/controls/button.js";
import { ImageBox } from "./sys32/controls/image.js";
import { Label } from "./sys32/controls/label.js";
import { Bitmap } from "./sys32/core/bitmap.js";
import { Box } from "./sys32/core/box.js";
import { dragMove, dragResize } from "./sys32/core/selections.js";
import { System, makeBuilder } from "./sys32/core/system.js";





const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.autoscale();
sys.root.layout = makeVacuumLayout();

const b = makeBuilder(sys);

let x = 10;

function makeWindow(title: string, content: Box) {
  const titlebar = b(Spaced, {
    padding: 1,
    onMouseDown: () => { sys.trackMouse({ move: dragMove(sys, win) }); },
  },
    b(Label, { text: title, color: 0xffffff33 }),
    b(Group, { gap: 2 },
      b(Button, {
        onClick: () => {
          const i = sys.root.children.indexOf(win);
          sys.root.children.splice(i, 1);
        }
      },
        b(ImageBox, {
          image: new Bitmap([0xffffff33], 3, [
            0, 0, 0,
            0, 0, 0,
            1, 1, 1,
          ])
        })
      ),
      b(Button, {
        onClick: () => {
          const i = sys.root.children.indexOf(win);
          sys.root.children.splice(i, 1);
        }
      },
        b(ImageBox, {
          image: new Bitmap([0xffffff33], 3, [
            1, 1, 1,
            1, 0, 1,
            1, 1, 1,
          ])
        })
      ),
      b(Button, {
        onClick: () => {
          const i = sys.root.children.indexOf(win);
          sys.root.children.splice(i, 1);
        }
      },
        b(ImageBox, {
          image: new Bitmap([0x990000ff], 3, [
            1, 0, 1,
            0, 1, 0,
            1, 0, 1,
          ])
        })
      ),
    )
  );
  const contentView = b(Group, { layout: makeVacuumLayout(1) },
    content
  );
  const win = b(Box, { w: 100, h: 100, background: 0x000000aa, layout: makeVacuumLayout(1) },
    b(Paned, { dir: 'y', vacuum: 'a' },
      titlebar,
      contentView,
    ),
    b(ImageBox, {
      passthrough: false,
      image: new Bitmap([0xffffff22], 3, [
        0, 0, 1,
        0, 0, 1,
        1, 1, 1,
      ]),
      layout: function (w, h) {
        this.x = w - this.w!;
        this.y = h - this.h!;
      },
      onMouseDown: () => {
        const resize = dragResize(sys, win);
        sys.trackMouse({
          move: () => {
            resize();
            sys.layoutTree(win);
          }
        });
      },
    }),
  );

  return win;
}


function newMapmaker() {
  const win = makeWindow('mapmaker', mapmaker(sys));

  win.x = x;
  win.y = x;
  x += 30;

  sys.root.children.push(win);
  sys.layoutTree();
}

sys.root.children.push(
  b(Paned, { vacuum: 'b', dir: 'y' },
    b(Box, { background: 0x333333ff, layout: centerLayout },
      demo(sys)
    ),
    b(Group, { background: 0x222222ff },
      b(Button, { onClick: newMapmaker, padding: 2 }, b(Label, { text: 'one' })),
    ),
  )
)

newMapmaker();

sys.layoutTree();
