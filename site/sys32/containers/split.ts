import { Bitmap } from "../core/bitmap.js";
import { crt } from "../core/crt.js";
import { sys, type Cursor } from "../core/system.js";
import { View } from "../core/view.js";
import { dragMove } from "../util/selections.js";

const xresize: Cursor = {
  bitmap: new Bitmap([0x00000099, 0xffffffff], 5, [
    1, 1, 1, 1, 1,
    1, 2, 2, 2, 1,
    1, 1, 1, 1, 1,
  ]),
  offset: [2, 1],
};

const yresize: Cursor = {
  bitmap: new Bitmap([0x00000099, 0xffffffff], 3, [
    1, 1, 1,
    1, 2, 1,
    1, 2, 1,
    1, 2, 1,
    1, 1, 1,
  ]),
  offset: [1, 2],
};

class SplitDivider extends View {

  pressed = false;
  split: Split;

  constructor(split: Split) {
    super();
    this.split = split;
    this.background = split.dividerColor;
    this.cursor = this.split.dir === 'x' ? xresize : yresize;
  }

  override draw(): void {
    super.draw();

    const dx = this.split.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    const x = dx === 'x' ? Math.round((this[dw] - this.split.dividerWidth) / 2) : 0;
    const y = dx === 'y' ? Math.round((this[dw] - this.split.dividerWidth) / 2) : 0;
    const w = dx === 'x' ? this.split.dividerWidth : this.w;
    const h = dx === 'y' ? this.split.dividerWidth : this.h;

    if (this.pressed) {
      crt.rectFill(x, y, w, h, this.split.dividerColorPress);
    }
    else if (this.hovered) {
      crt.rectFill(x, y, w, h, this.split.dividerColorHover);
    }
  }

  override onMouseDown(): void {
    const s = this.split;
    const dx = s.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    const b = { x: 0, y: 0 };
    b[dx] = s.pos;

    this.pressed = true;

    const drag = dragMove(b);
    sys.trackMouse({
      move: () => {
        drag();
        s.pos = b[dx];
        if (s.min && s.pos < s.min) s.pos = s.min;
        if (s.max && s.pos > s[dw] - s.max) s.pos = s[dw] - s.max;
        this.split.layoutTree();
      },
      up: () => this.pressed = false,
    });
  }

}

export class Split extends View {

  pos = 10;
  min = 0;
  max = 0;
  dir: 'x' | 'y' = 'y';
  dividerWidth = 1;
  dividerColor = 0x33333300;
  dividerColorHover = 0xffffff33;
  dividerColorPress = 0x1177ffcc;
  resizable = false;

  #resizer?: View;

  override init(): void {
    while (this.children.length < 2) {
      this.addChild(sys.make(View, {}));
    }
  }

  override layout(): void {
    if (this.resizable && !this.#resizer) {
      this.#resizer = new SplitDivider(this);
      this.addChild(this.#resizer);
    }
    else if (!this.resizable && this.#resizer) {
      this.#resizer = undefined!;
      this.removeChild(this.#resizer);
    }

    const dx = this.dir;
    const dw = dx === 'x' ? 'w' : 'h';
    const [a, b] = this.children;

    a.x = b.x = 0;
    a.y = b.y = 0;
    a.w = b.w = this.w;
    a.h = b.h = this.h;

    a[dw] = this.pos;

    b[dx] = this.pos;
    b[dw] = this[dw] - this.pos;

    if (this.#resizer) {
      this.#resizer.x = 0;
      this.#resizer.y = 0;
      this.#resizer.w = this.w;
      this.#resizer.h = this.h;

      this.#resizer[dx] = this.pos - 1;
      this.#resizer[dw] = this.dividerWidth + 2;
    }
  }

}

export class SplitX extends Split {
  override dir = 'x' as const;
}

export class SplitY extends Split {
  override dir = 'y' as const;
}
