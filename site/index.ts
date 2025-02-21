import { demo } from "./demo.js";
import mapmaker from "./mapmaker.js";
import { Group } from "./sys32/containers/group.js";
import { centerLayout, makeVacuumLayout } from "./sys32/containers/layouts.js";
import { Paned } from "./sys32/containers/paned.js";
import { Spaced } from "./sys32/containers/spaced.js";
import { Button } from "./sys32/controls/button.js";
import { ImageView } from "./sys32/controls/image.js";
import { Label } from "./sys32/controls/label.js";
import { Bitmap } from "./sys32/core/bitmap.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { makeBuilder } from "./sys32/util/build.js";
import { dragMove, dragResize } from "./sys32/util/selections.js";





const minImage = new Bitmap([0xffffff33], 3, [0, 0, 0, 0, 0, 0, 1, 1, 1,]);
const maxImage = new Bitmap([0xffffff33], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]);
const axeImage = new Bitmap([0x990000ff], 3, [1, 0, 1, 0, 1, 0, 1, 0, 1,]);
const adjImage = new Bitmap([0xffffff11], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,]);

export class Panel {

  #window;
  ws: Workspace;

  constructor(ws: Workspace, title: string, content: View, background = 0x000000aa) {
    this.ws = ws;

    const sys = ws.sys;
    const b = makeBuilder(sys);

    this.#window = b(View, { w: 100, h: 100, background, layout: makeVacuumLayout(1) },
      b(Paned, { dir: 'y', vacuum: 'a' },
        b(Spaced, { padding: 1, onMouseDown: () => { sys.trackMouse({ move: dragMove(sys, this.#window) }); }, },
          b(Label, { text: title, color: 0xffffff33 }),
          b(Group, { gap: 2 },
            b(Button, { onClick: () => this.minimize() }, b(ImageView, { image: minImage })),
            b(Button, { onClick: () => this.maximize() }, b(ImageView, { image: maxImage })),
            b(Button, { onClick: () => this.close() }, b(ImageView, { image: axeImage }))
          )
        ),
        b(Group, { layout: makeVacuumLayout(1) }, content),
      ),
      b(ImageView, {
        passthrough: false,
        image: adjImage,
        layout: function (w, h) { this.x = w - this.w!; this.y = h - this.h!; },
        onMouseDown: () => {
          const resize = dragResize(sys, this.#window);
          sys.trackMouse({ move: () => { resize(); sys.layoutTree(this.#window); } });
        },
      }),
    );
  }

  close() {

  }

  minimize() {

  }

  maximize() {
    this.#window.x = this.#window.y = 0;
    this.#window.w = this.ws.desktop.w;
    this.#window.h = this.ws.desktop.h;
    this.ws.sys.layoutTree(this.#window);
  }

  show() {
    this.ws.desktop.children.push(this.#window);
    this.ws.sys.layoutTree();
  }

  hide() {

  }

}






let i = 0;

export class Workspace {

  sys: System;
  desktop;
  taskbar;

  constructor(sys: System) {
    this.sys = sys;

    const b = makeBuilder(sys);
    this.desktop = b(View, { background: 0x333333ff });
    this.taskbar = b(Spaced, { background: 0x000000ff },
      b(Group, { background: 0x222222ff },
        b(Button, {
          padding: 2, onClick() {
            // i++
            i = (i + 1) % 2;
            sys.resize(320 * (i + 1), 180 * (i + 1));
          }
        }, b(Label, { text: 'one' }))
      ),
      b(Group, { background: 0x222222ff },
      )
    );

    sys.root.children = [
      b(Paned, { vacuum: 'b', dir: 'y' },
        this.desktop,
        this.taskbar,
      )
    ];

    sys.layoutTree();
  }

}










const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();
sys.root.layout = makeVacuumLayout();
const b = makeBuilder(sys);


const ws = new Workspace(sys);

const win = new Panel(ws, 'mapmaker', mapmaker(sys));
win.show();

const win2 = new Panel(ws, 'demo',
  b(View, { layout: makeVacuumLayout(0) },
    b(View, { layout: centerLayout },
      demo(sys)
    )
  )
);
win2.show();
