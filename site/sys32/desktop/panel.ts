import { Border } from "../containers/border.js";
import { Group } from "../containers/group.js";
import { PanedYA } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { makeButton } from "../controls/button.js";
import { ImageView } from "../controls/image.js";
import { Label } from "../controls/label.js";
import { Bitmap } from "../core/bitmap.js";
import { type Cursor, System } from "../core/system.js";
import { View } from "../core/view.js";
import { Listener, Reactive } from "../util/events.js";
import { makeVacuumLayout } from "../util/layouts.js";
import { dragMove, dragResize } from "../util/selections.js";

const minImage = new Bitmap([0xaaaaaaff], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,]);
const maxImage = new Bitmap([0xaaaaaaff], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,]);
const axeImage = new Bitmap([0xaaaaaaff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,]);
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,]);

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

  didClose = new Listener();

  override background = 0x070707ee;
  override layout = makeVacuumLayout(0);

  title = '';

  override w = 240;
  override h = 140;

  minw = 30;
  minh = 30;

  #lastPos?: { x: number, y: number, w: number, h: number };

  border!: Border;

  override init(): void {
    const pad = 2;

    const content = this.children[0];


    class ClickCounter {

      count = 0;
      clear!: ReturnType<typeof setTimeout>;
      #secDelay: number;

      constructor(secDelay = 333) {
        this.#secDelay = secDelay;
      }

      increase() {
        this.count++;
        clearTimeout(this.clear);
        this.clear = setTimeout(() => this.count = 0, this.#secDelay);
      }

    }


    const counter = new ClickCounter();

    let titleLabel: Label;

    this.children = [

      this.border = this.sys.make(Border, {
        all: 1,
        layout: makeVacuumLayout(1),
      },


        this.sys.make(PanedYA, {},

          this.sys.make(Spaced, {
            onMouseDown: () => {
              counter.increase();
              const drag = dragMove(this.sys, this);
              this.sys.trackMouse({
                move: () => {
                  const moved = drag();
                  if (Math.hypot(moved.x, moved.y) > 1) {
                    counter.count = 0;
                    this.#lastPos = undefined!;
                  }
                },
                up: () => {
                  if (counter.count >= 2) {
                    this.maximize();
                  }
                },
              });
            },
          },
            this.sys.make(Border, { l: pad },
              titleLabel = this.sys.make(Label, { color: 0xaaaaaaff })
            ),
            this.sys.make(Group, { gap: 0 },
              this.sys.make(Border, { all: 2, ...makeButton(() => this.minimize(), 0xffffff33).all }, this.sys.make(ImageView, { image: minImage })),
              this.sys.make(Border, { all: 2, ...makeButton(() => this.maximize(), 0xffffff33).all }, this.sys.make(ImageView, { image: maxImage })),
              this.sys.make(Border, { all: 2, ...makeButton(() => this.close(), 0x770000ff, 0x440000ff).all }, this.sys.make(ImageView, { image: axeImage }))
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
                this.layoutTree();
              }
            });
          },
        }),


      )

    ];

    this.watch('title', s => titleLabel.text = s);
    this.watch('panelFocused', b => { this.border.borderColor = b ? 0x005599ff : 0; });
  }

  close() {
    this.parent!.removeChild(this);
    this.didClose.dispatch();
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
      this.layoutTree();
    }
    else {
      this.#lastPos = { x: this.x, y: this.y, w: this.w, h: this.h };

      // const a = { ...this.#lastPos };
      // const b = { x: 0, y: 0, w: this.parent!.w, h: this.parent!.h };

      // let total = 100;
      // let sofar = 0;

      // const done = this.sys.onTick.watch(delta => {
      //   sofar += delta;
      //   if (sofar >= total) done();
      //   let p = Math.min(1, Math.max(0, sofar / total));
      //   p = -(Math.cos(Math.PI * p) - 1) / 2;

      //   this.x = Math.round((b.x - a.x) * p + a.x);
      //   this.y = Math.round((b.y - a.y) * p + a.y);
      //   this.w = Math.round((b.w - a.w) * p + a.w);
      //   this.h = Math.round((b.h - a.h) * p + a.h);
      //   this.layoutTree();
      // });

      this.x = 0;
      this.y = 0;
      this.w = this.parent!.w;
      this.h = this.parent!.h;
      this.layoutTree();
    }

  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  override onFocus(): void {
    const old = focusedPanel.get(this.sys);
    if (old === this) return;

    if (old) old.#unfocus();

    focusedPanel.set(this.sys, this);
    this.#focus();
  }

  #unfocus() {
    this.panelFocused = false;
  }

  #focus() {
    this.panelFocused = true;

    const parent = this.parent!;
    parent.removeChild(this);
    parent.addChild(this);
  }

  panelFocused = false;

}

const focusedPanel = new WeakMap<System, Panel>();
