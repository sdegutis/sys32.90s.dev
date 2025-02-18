import { Bitmap } from "./bitmap.js";
import { Box, MouseTracker } from "./box.js";
import { Screen } from "./screen.js";
import { dragMove } from "./selections.js";

class SplitBoxDivider extends Box {

  static xresize = {
    bitmap: new Bitmap([0x00000099, 0xffffffff], [
      1, 1, 1, 1, 1, -1,
      1, 2, 1, 2, 1, -1,
      1, 1, 1, 1, 1, -1,
    ]),
    offset: [2, 1],
  };

  static yresize = {
    bitmap: new Bitmap([0x00000099, 0xffffffff], [
      1, 1, 1, -1,
      1, 2, 1, -1,
      1, 1, 1, -1,
      1, 2, 1, -1,
      1, 1, 1, -1,
    ]),
    offset: [1, 2],
  };

  pressed = false;

  constructor(screen: Screen, public split: SplitBox) {
    super(screen);
    this.background = split.dividerColor;
  }

  layout(): void {
    const dx = this.split.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    this.trackingArea = { x: 0, y: 0, w: this.w, h: this.h };
    this.trackingArea[dx] = -3;
    this.trackingArea[dw] = this.split.dividerWidth + 6;
  }

  draw(): void {
    if (this.pressed) {
      this.screen.rectFill(0, 0, this.w, this.h, this.split.dividerColorPress);
    }
    else if (this.hovered) {
      this.screen.rectFill(0, 0, this.w, this.h, this.split.dividerColorHover);
    }
  }

  drawCursor(x: number, y: number): void {
    const cursor = this.split.dir === 'x' ?
      SplitBoxDivider.xresize :
      SplitBoxDivider.yresize;
    cursor.bitmap.draw(this.screen, x - cursor.offset[0], y - cursor.offset[1]);
  }

  onMouseDown(trackMouse: MouseTracker): void {
    const s = this.split;
    const dx = s.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    const b = { x: 0, y: 0 };
    b[dx] = s.pos;

    this.pressed = true;

    const drag = dragMove(this.screen, b);
    trackMouse({
      move: () => {
        drag();
        s.pos = b[dx];
        if (s.min && s.pos < s.min) s.pos = s.min;
        if (s.max && s.pos > s[dw] - s.max) s.pos = s[dw] - s.max;
        this.screen.layoutTree(this.split);
      },
      up: () => this.pressed = false,
    });
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
  dividerColorPress = 0xffffff77;

  a = new Box(this.screen);
  b = new Box(this.screen);
  #resizer?: Box;
  children = [this.a, this.b];

  get resizable() { return this.#resizer !== undefined; }
  set resizable(should: boolean) {
    if (should) {
      this.#resizer = new SplitBoxDivider(this.screen, this);
      this.children = [this.a, this.b, this.#resizer];
    }
    else {
      this.#resizer = undefined;
      this.children = [this.a, this.b];
    }
  }

  layout(): void {
    const dx = this.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    this.a.x = this.b.x = 0;
    this.a.y = this.b.y = 0;
    this.a.w = this.b.w = this.w;
    this.a.h = this.b.h = this.h;

    this.a[dw] = this.pos;

    this.b[dx] = this.pos;
    this.b[dw] = this[dw] - this.pos;

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
