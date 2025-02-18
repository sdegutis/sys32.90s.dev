import { Bitmap, Box, Font, MouseTracker, Screen, dragMove } from "./crt.js";

// static props: Property[] = [
//   { name: 'x', type: 'number' },
//   { name: 'y', type: 'number' },
//   { name: 'w', type: 'number' },
//   { name: 'h', type: 'number' },
//   { name: 'background', type: 'color' },
// ];

// export type Property = {
//   name: string,
//   type: 'number' | 'string' | 'color' | 'boolean',
// };

const screen = new Screen(document.querySelector('canvas')!);
screen.autoscale();

class BorderBox extends Box {

  border = 0xffffff33;

  draw(): void {
    this.screen.rectLine(0, 0, this.w, this.h, this.border);
  }

}

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
    if (this.hovered) {
      screen.rectFill(0, 0, this.w, this.h, this.split.dividerColorHover);
    }
  }

  drawCursor(x: number, y: number): void {
    const cursor = this.split.dir === 'x' ?
      SplitBoxDivider.xresize :
      SplitBoxDivider.yresize;
    cursor.bitmap.draw(screen, x - cursor.offset[0], y - cursor.offset[1]);
  }

  onMouseDown(trackMouse: MouseTracker): void {
    const s = this.split;
    const dx = s.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    const b = { x: 0, y: 0 };
    b[dx] = s.pos;
    const drag = dragMove(this.screen, b);
    trackMouse({
      move: () => {
        drag();
        s.pos = b[dx];
        if (s.min && s.pos < s.min) s.pos = s.min;
        if (s.max && s.pos > s[dw] - s.max) s.pos = this[dw] - s.max;
        this.screen.layoutTree(this.split);
      },
    });
  }

}

class SplitBox extends Box {

  pos = 10;
  min = 0;
  max = 0;
  dir: 'x' | 'y' = 'y';
  dividerWidth = 1;
  dividerColor = 0x33333300;
  dividerColorHover = 0xffffff33;

  a = new Box(this.screen);
  b = new Box(this.screen);
  #resizer?: Box;
  children = [this.a, this.b];

  get resizable() { return this.#resizer !== undefined; }
  set resizable(should: boolean) {
    if (should) {
      this.#resizer = new SplitBoxDivider(screen, this);
      this.children = [this.a, this.b, this.#resizer];
    }
    else {
      this.#resizer = undefined;
      this.children = [this.a, this.b];
    }
  }

  layout(): void {
    this.children = [this.a, this.b];
    if (this.#resizer) this.children.push(this.#resizer);

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

const split = new SplitBox(screen);
split.w = 320;
split.h = 180;
split.pos = 10;
split.min = 8;
split.max = 18;
split.dir = 'y';

const red = new BorderBox(screen); red.background = 0x330000ff; red.border = 0xffffff00;
const green = new BorderBox(screen); green.background = 0x003300ff; green.border = 0xffffff00;
const blue = new BorderBox(screen); blue.background = 0x000033ff; blue.border = 0xffffff00;

const split2 = new SplitBox(screen);
split2.resizable = true;
split2.pos = 30;
split2.min = 28;
split2.max = 38;
split2.dir = 'x';

screen.root.children.push(split);

split.a = blue;
split.b = split2;

split2.a = red;
split2.b = green;

split.resizable = true;







class GridBox extends Box {

  // static props: Property[] = [
  //   ...super.props,
  //   { name: 'id', type: 'string' },
  // ];

}


// console.log(GridBox.props)






class Label extends Box {

  #text = '';
  font = Font.crt2025;
  padding = 1;
  passthrough = true;

  constructor(screen: Screen, text: string) {
    super(screen);
    this.text = text;
  }

  get text() { return this.#text; }
  set text(s: string) {
    this.#text = s;
    const size = this.font.calcSize(s);
    this.w = size.w + this.padding * 2;
    this.h = size.h + this.padding * 2;
  }

  draw() {
    this.screen.print(this.padding, this.padding, 0xffffffff, this.text);
  }

}


class Button extends BorderBox {

  padding = 5;
  pressColor = 0x00000033;
  hoverColor = 0x00000000;

  onClick?(): void;

  pressed = false;

  children: Box[] = [new Label(screen, 'button')];

  get child() { return this.children[0]; }
  set child(child: Box) {
    this.children = [child];
    child.x = this.padding;
    child.y = this.padding;
    this.w = child.w + this.padding * 2;
    this.h = child.h + this.padding * 2;
  }

  onMouseDown(trackMouse: MouseTracker): void {
    this.pressed = true;
    trackMouse({
      move: () => {
        if (!this.hovered) {
          this.pressed = false;
        }
      },
      up: () => {
        if (this.pressed) {
          this.onClick?.();
        }
        this.pressed = false;
      },
    });
  }

  draw(): void {
    super.draw();
    if (this.pressed) {
      this.screen.rectFill(0, 0, this.w, this.h, this.pressColor);
    }
    else if (this.hovered) {
      this.screen.rectFill(0, 0, this.w, this.h, this.hoverColor);
    }
  }

}

const button = new Button(screen);
button.x = 30;
button.y = 30;
button.background = 0x00000033;
button.border = 0xff000033;
green.children.push(button);

const label = new Label(screen, 'yes \\n no');

button.child = label;
button.onClick = () => console.log('clicked')

// button.children.push(label);


screen.layoutTree();

green.background = 0x222222ff;

const button2 = new Button(screen);
button2.padding = 2;
button2.x = 90;
button2.y = 30;
button2.background = 0x00000033;
button2.border = 0x999999ff;
green.children.push(button2);


// button2.onMouseDown = (t) => {
//   t({
//     move: () => {

//     },
//     up: () => {
//       screen.pset(screen.mouse.x, screen.mouse.y, 0xffffff99)
//       console.log(screen.#hovered.mouse.x, screen.#hovered.mouse.y, screen.#hovered)

//     },
//   })
// };

const b = new Box(screen);
b.background = 0x990000ff;
b.passthrough = true;
b.w = 3;
b.h = 3;
button2.child = b;
