import { Bitmap, Box, Font, Property, Screen, dragMove } from "./crt.js";

const screen = new Screen(document.querySelector('canvas')!);
screen.autoscale();

class BorderBox extends Box {

  border = 0xffffff33;

  draw = () => {
    this.screen.rectLine(0, 0, this.w, this.h, this.border);
  };

}

class SplitBox extends Box {

  pos = 10;
  min = 0;
  max = 0;
  dir: 'x' | 'y' = 'y';
  resizable = false;
  dividerWidth = 1;
  dividerColor = 0x333333ff;
  dividerColorHover = 0xffffff33;

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

  #resizer?: Box;

  layout = () => {
    const dx = this.dir;
    const dw = dx === 'x' ? 'w' : 'h';

    if (!this.resizable && this.#resizer) {
      this.children.splice(2, 1);
      this.#resizer = undefined;
    }
    else if (this.resizable && !this.#resizer) {
      const cursor = this.dir === 'x' ? SplitBox.xresize : SplitBox.yresize;

      this.#resizer = new Box(screen);
      this.#resizer.background = this.dividerColor;

      this.#resizer.draw = () => {
        if (this.#resizer?.hovered) {
          screen.rectFill(0, 0, this.#resizer.w, this.#resizer.h, this.dividerColorHover);
        }
      };

      this.#resizer.drawCursor = (x, y) => {
        cursor.bitmap.draw(screen, x - cursor.offset[0], y - cursor.offset[1]);
      };

      this.#resizer.onMouseDown = (trackMouse) => {
        const b = { x: 0, y: 0 };
        b[dx] = this.pos;
        const drag = dragMove(this.screen, b);
        trackMouse({
          move: () => {
            drag();
            this.pos = b[dx];
            if (this.min && this.pos < this.min) this.pos = this.min;
            if (this.max && this.pos > this[dw] - this.max) this.pos = this[dw] - this.max;
            this.screen.layoutTree(this);
          },
        });
      };
      this.children.push(this.#resizer);
    }

    const steps = [this.pos, this[dw] - this.pos];
    if (this.resizable) {
      steps[1] -= this.dividerWidth;
      steps.splice(1, 0, this.dividerWidth);
    }

    if (this.#resizer) {
      this.children.splice(2, 1);
      this.children.splice(1, 0, this.#resizer);
    }

    let x = 0;
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].x = 0;
      this.children[i].y = 0;
      this.children[i].w = this.w;
      this.children[i].h = this.h;

      this.children[i][dx] = x;
      this.children[i][dw] = steps[i];
      x += steps[i];
    }

    if (this.#resizer) {
      this.children.splice(1, 1);
      this.children.push(this.#resizer);
    }

    if (this.#resizer) {
      this.#resizer.trackingArea = { x: 0, y: 0, w: this.w, h: this.h };
      this.#resizer.trackingArea[dx] = -3;
      this.#resizer.trackingArea[dw] = this.dividerWidth + 6;
    }
  };

}

const split = new SplitBox(screen);
split.w = 320;
split.h = 180;
split.pos = 10;
split.min = 8;
split.max = 18;
split.dir = 'y';

const red = new BorderBox(screen); red.background = 0x330000ff; //red.border = 0xffffff00;
const green = new BorderBox(screen); green.background = 0x003300ff; //green.border = 0xffffff00;
const blue = new BorderBox(screen); blue.background = 0x000033ff; //blue.border = 0xffffff00;

const split2 = new SplitBox(screen);
split2.resizable = true;
split2.pos = 30;
split2.min = 28;
split2.max = 38;
split2.dir = 'x';

screen.root.children.push(split);

split.children.push(blue);
split.children.push(split2);

split2.children.push(red);
split2.children.push(green);

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
  background = 0xffffff33;
  passthrough = true;

  get text() { return this.#text; }
  set text(s: string) {
    this.#text = s;
    const size = this.font.calcSize(s);
    this.w = size.w + this.padding * 2;
    this.h = size.h + this.padding * 2;
  }

  draw = () => {
    this.screen.print(this.padding, this.padding, 0xffffffff, this.text);
  };

}


class Button extends BorderBox {

  #label?: Label;
  padding = 5;

  get label(): Label | undefined { return this.#label; }
  set label(l: Label | undefined) {
    this.#label = l;
    this.children = l ? [l] : [];
    if (l) {
      l.x = this.padding;
      l.y = this.padding;
      this.w = l.w + this.padding * 2;
      this.h = l.h + this.padding * 2;
    }
  }

  constructor(screen: Screen) {
    super(screen);

    const oldDraw = this.draw;

    this.draw = () => {
      oldDraw();
      if (this.hovered) {
        this.screen.rectFill(0, 0, this.w, this.h, 0x00000033);
      }
    }
  }


}

const button = new Button(screen);
button.x = 30;
button.y = 30;
button.w = 30;
button.h = 10;
button.background = 0x00000033;
button.border = 0xff0000ff;
green.children.push(button);

const label = new Label(screen);
// label.w = 30;
// label.h = 10;
label.text = 'yes\nno\nhmm this';

button.label = label;

// button.children.push(label);


screen.layoutTree();
