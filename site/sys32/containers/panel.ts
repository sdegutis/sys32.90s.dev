import { Button } from "../controls/button.js";
import { ImageView } from "../controls/image.js";
import { Label } from "../controls/label.js";
import { Bitmap } from "../core/bitmap.js";
import { Cursor } from "../core/system.js";
import { View } from "../core/view.js";
import { makeVacuumLayout } from "../util/layouts.js";
import { dragMove, dragResize } from "../util/selections.js";
import { Group } from "./group.js";
import { Paned } from "./paned.js";
import { Spaced } from "./spaced.js";

const minImage = new Bitmap([0xffffff33], 3, [0, 0, 0, 0, 0, 0, 1, 1, 1,]);
const maxImage = new Bitmap([0xffffff33], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]);
const axeImage = new Bitmap([0x990000ff], 3, [1, 0, 1, 0, 1, 0, 1, 0, 1,]);
const adjImage = new Bitmap([0xffffff11], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,]);

const adjCursor: Cursor = {
  bitmap: new Bitmap([0x000000cc, 0xffffffff], 5, [
    0, 1, 1, 1, 0,
    1, 1, 2, 1, 1,
    1, 2, 2, 2, 1,
    1, 1, 2, 1, 1,
    0, 1, 1, 1, 0,
  ]),
  offset: [2, 2],
};

export class Panel extends View {

  override background = 0x000000aa;
  override layout = makeVacuumLayout(0);

  title = '';
  content = this.sys.make(View);
  bare = false;

  #lastPos?: { x: number, y: number, w: number, h: number };

  override init(): void {
    if (this.bare) {
      this.layout = makeVacuumLayout();
      this.children = [this.content];
      return;
    }

    const pad = 2;

    const $ = this.sys.make.bind(this.sys);
    this.children = [

      $(Paned, { dir: 'y', vacuum: 'a' },

        $(Spaced, {
          padding: pad, onMouseDown: () => {
            const move = dragMove(this.sys, this);
            this.#lastPos = undefined!;
            this.sys.trackMouse({ move });
          },
        },
          $(Label, { text: this.title, color: 0xffffff33 }),
          $(Group, { gap: 2 },
            $(Button, { onClick: () => this.minimize() }, $(ImageView, { image: minImage })),
            $(Button, { onClick: () => this.maximize() }, $(ImageView, { image: maxImage })),
            $(Button, { onClick: () => this.close() }, $(ImageView, { image: axeImage }))
          )
        ),

        $(Group, {
          layout: function (this: View) {
            const c = this.firstChild!;
            c.x = pad;
            c.y = 0;
            c.w = this.w - (pad * 2);
            c.h = this.h - pad;
          }
        }, this.content),

      ),

      $(ImageView, {
        passthrough: false,
        image: adjImage,
        mouse: { x: 0, y: 0, cursor: adjCursor },
        layout: function (w, h) { this.x = w - this.w!; this.y = h - this.h!; },
        onMouseDown: () => {
          this.#lastPos = undefined!;
          const resize = dragResize(this.sys, this);
          this.sys.trackMouse({ move: () => { resize(); this.sys.layoutTree(this); } });
        },
      }),

    ];
  }

  close() {
    this.parent.removeChild(this);
  }

  minimize() {
    this.visible = false;
  }

  maximize() {
    if (this.#lastPos) {
      this.x = this.#lastPos.x;
      this.y = this.#lastPos.y;
      this.w = this.#lastPos.w;
      this.h = this.#lastPos.h;
      this.#lastPos = undefined!;
    }
    else {
      this.#lastPos = { x: this.x, y: this.y, w: this.w, h: this.h };
      this.x = this.y = 0;
      this.w = this.parent.w;
      this.h = this.parent.h;
    }

    this.sys.layoutTree(this);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

}
