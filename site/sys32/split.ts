import { Bitmap } from "./bitmap.js";
import { Box } from "./box.js";
import { System } from "./system.js";
import { dragMove } from "./selections.js";

const xresize = {
  bitmap: new Bitmap([0x00000099, 0xffffffff], [
    1, 1, 1, 1, 1, -1,
    1, 2, 2, 2, 1, -1,
    1, 1, 1, 1, 1, -1,
  ]),
  offset: [2, 1],
};

const yresize = {
  bitmap: new Bitmap([0x00000099, 0xffffffff], [
    1, 1, 1, -1,
    1, 2, 1, -1,
    1, 2, 1, -1,
    1, 2, 1, -1,
    1, 1, 1, -1,
  ]),
  offset: [1, 2],
};

class SplitBoxDivider extends Box {

  pressed = false;
  #hovered = false;

  constructor(sys: System, public split: SplitBox) {
    super(sys);
    this.background = split.dividerColor;
  }

  override layout(): void {
    const dx = this.split.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    this.trackingArea = { x: 0, y: 0, w: this.w, h: this.h };
    this.trackingArea[dx] = -3;
    this.trackingArea[dw] = this.split.dividerWidth + 6;
  }

  override draw(): void {
    if (this.pressed) {
      this.sys.rectFill(0, 0, this.w, this.h, this.split.dividerColorPress);
    }
    else if (this.#hovered) {
      this.sys.rectFill(0, 0, this.w, this.h, this.split.dividerColorHover);
    }
  }

  override drawCursor(x: number, y: number): void {
    const cursor = this.split.dir === 'x' ? xresize : yresize;
    cursor.bitmap.draw(this.sys, x - cursor.offset[0], y - cursor.offset[1]);
  }

  override onMouseDown(): void {
    const s = this.split;
    const dx = s.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    const b = { x: 0, y: 0 };
    b[dx] = s.pos;

    this.pressed = true;

    const drag = dragMove(this.sys, b);
    this.sys.trackMouse({
      move: () => {
        drag();
        s.pos = b[dx];
        if (s.min && s.pos < s.min) s.pos = s.min;
        if (s.max && s.pos > s[dw] - s.max) s.pos = s[dw] - s.max;
        this.sys.layoutTree(this.split);
      },
      up: () => this.pressed = false,
    });
  }

  override onMouseEnter(): void {
    super.onMouseEnter?.();
    this.#hovered = true;
  }

  override onMouseExit(): void {
    super.onMouseExit?.();
    this.#hovered = false;
  }

}

export class SplitBox extends Box {

  pos = 10;
  min = 0;
  max = 0;
  dir: 'x' | 'y' = 'y';
  dividerWidth = 1;
  dividerColor = 0x33333300;
  dividerColorHover = 0xffffff33;
  dividerColorPress = 0x1177ffcc;
  resizable = false;
  vacuum: 'a' | 'b' | undefined;

  #resizer?: Box;
  override children = [new Box(this.sys), new Box(this.sys)];

  override adjust(): void {
    if (this.vacuum) {
      const pane = this.children[this.vacuum === 'a' ? 0 : 1];
      const dx = this.dir;
      const dw = dx === 'x' ? 'w' : 'h';
      this.pos = (this.vacuum === 'a' ? pane[dw] : this[dw] - pane[dw]);
    }
  }

  override layout(): void {
    if (this.resizable && !this.#resizer) {
      this.#resizer = new SplitBoxDivider(this.sys, this);
      this.children.push(this.#resizer);
    }
    else if (!this.resizable && this.#resizer) {
      this.#resizer = undefined!;
      this.children.pop();
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

      this.#resizer[dx] = this.pos;
      this.#resizer[dw] = this.dividerWidth;
    }
  }

}
