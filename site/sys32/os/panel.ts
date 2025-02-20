import { Group, Spaced } from "../containers/group.js";
import { makeVacuumLayout } from "../containers/layouts.js";
import { Paned } from "../containers/paned.js";
import { Button } from "../controls/button.js";
import { ImageView } from "../controls/image.js";
import { Label } from "../controls/label.js";
import { Bitmap } from "../core/bitmap.js";
import { View } from "../core/view.js";
import { makeBuilder } from "../util/build.js";
import { dragMove, dragResize } from "../util/selections.js";
import { Workspace } from "./workspace.js";

const minImage = new Bitmap([0xffffff33], 3, [0, 0, 0, 0, 0, 0, 1, 1, 1,]);
const maxImage = new Bitmap([0xffffff33], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]);
const axeImage = new Bitmap([0x990000ff], 3, [1, 0, 1, 0, 1, 0, 1, 0, 1,]);
const adjImage = new Bitmap([0xffffff11], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,]);

export class Panel {

  #window;

  constructor(public ws: Workspace, title: string, content: View, background = 0x000000aa) {
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
