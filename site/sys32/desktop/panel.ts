import { Group } from "../containers/group.js";
import { Paned } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { ImageView } from "../controls/image.js";
import { Label } from "../controls/label.js";
import { Bitmap } from "../core/bitmap.js";
import { Cursor } from "../core/system.js";
import { View } from "../core/view.js";
import { multifn } from "../util/events.js";
import { makeVacuumLayout } from "../util/layouts.js";
import { dragMove, dragResize } from "../util/selections.js";

const minImage = new Bitmap([0xaaaaaaff], 4, [
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  1, 1, 1, 1,]);
const maxImage = new Bitmap([0xaaaaaaff], 4, [
  1, 1, 1, 1,
  1, 0, 0, 1,
  1, 0, 0, 1,
  1, 1, 1, 1,]);
const axeImage = new Bitmap([0xaaaaaaff], 4, [
  1, 0, 0, 1,
  0, 1, 1, 0,
  0, 1, 1, 0,
  1, 0, 0, 1,]);
const adjImage = new Bitmap([0xffffff11], 3, [
  0, 0, 1,
  0, 0, 1,
  1, 1, 1,]);

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

  didClose = multifn();

  override background = 0x070707ee;
  override layout = makeVacuumLayout(0);

  title = '';

  override w = 240;
  override h = 140;

  minw = 30;
  minh = 30;

  #lastPos?: { x: number, y: number, w: number, h: number };

  override init(): void {
    const pad = 2;

    const content = this.children[0];

    this.children = [

      this.sys.make(Paned, { dir: 'y', vacuum: 'a' },

        this.sys.make(Spaced, {
          padding: 0,
          onMouseDown: () => {
            const move = dragMove(this.sys, this);
            this.#lastPos = undefined!;
            this.sys.trackMouse({ move });
          },
        },
          this.sys.make(Label, { padding: pad, text: this.title, color: 0xaaaaaaff }),
          this.sys.make(Group, { gap: 0 },
            this.sys.make(Button, { hoverColor: 0xffffff33, onClick: () => this.minimize() }, this.sys.make(ImageView, { padding: 2, image: minImage })),
            this.sys.make(Button, { hoverColor: 0xffffff33, onClick: () => this.maximize() }, this.sys.make(ImageView, { padding: 2, image: maxImage })),
            this.sys.make(Button, { hoverColor: 0x770000ff, onClick: () => this.close() }, this.sys.make(ImageView, { padding: 2, image: axeImage }))
          )
        ),

        this.sys.make(Group, {
          layout: function (this: View) {
            const c = this.firstChild!;
            c.x = pad;
            c.y = 0;
            c.w = this.w - (pad * 2);
            c.h = this.h - pad;
          }
        }, content),

      ),

      this.sys.make(ImageView, {
        passthrough: false,
        image: adjImage,
        cursor: adjCursor,
        layout: function () {
          this.x = this.parent!.w - this.w!;
          this.y = this.parent!.h - this.h!;
        },
        onMouseDown: () => {
          this.#lastPos = undefined!;
          const resize = dragResize(this.sys, this);
          this.sys.trackMouse({
            move: () => {
              resize();
              if (this.w < this.minw) this.w = this.minw;
              if (this.h < this.minh) this.h = this.minh;
              this.sys.layoutTree(this);
            }
          });
        },
      }),

    ];
  }

  close() {
    this.parent!.removeChild(this);
    this.didClose();
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
      this.w = this.parent!.w;
      this.h = this.parent!.h;
    }

    this.sys.layoutTree(this);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  override willFocus(): void {
    // console.log(this, this.sys.focused)
  }

  override onFocus(): void {
    // console.log(this.sys.focused)

    const parent = this.parent!;
    parent.removeChild(this);
    parent.addChild(this);
  }

}
