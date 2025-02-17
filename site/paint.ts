import { Bitmap, Box, Screen, TileSelection, dragMove, dragResize } from "./crt.js";

const screen = new Screen(document.querySelector('canvas')!);
screen.autoscale();

class BorderBox extends Box {

  border = 0xffffff33;

  draw = () => {
    this.screen.rectLine(0, 0, this.w, this.h, this.border);
  };

}

class SplitDivider extends Box {


}

class SplitBox extends Box {

  pos = 0;
  dir: 'x' | 'y' = 'y';
  resizable = false;
  dividerWidth = 2;
  dividerColor = 0x000000ff;

  static xresize = {
    bitmap: new Bitmap([0x00000099, 0xffffffff], [
      1, 1, 1, 1, 1, -1,
      1, 2, 2, 2, 1, -1,
      1, 1, 1, 1, 1, -1,
    ]),
    offset: [2, 1],
  };

  static yresize = {
    bitmap: new Bitmap([0x00000099, 0xffffffff], [
      1, 1, 1, -1,
      1, 2, 1, -1,
      1, 2, 1, -1,
      1, 2, 1, -1,
      1, 1, 1, -1,
    ]),
    offset: [1, 2],
  };

  #resizer?: Box;

  layout = () => {
    const dw = this.dir === 'x' ? 'w' : 'h';
    const dx = this.dir;

    if (!this.resizable && this.#resizer) {
      this.children.splice(1, 1);
      this.#resizer = undefined;
    }
    else if (this.resizable && !this.#resizer) {
      this.#resizer = new Box();
      this.#resizer.background = this.dividerColor;
      this.#resizer.drawCursor = () => {
        const c = this.dir === 'x' ? SplitBox.xresize : SplitBox.yresize;
        c.bitmap.draw(screen, screen.mouse.x - c.offset[0], screen.mouse.y - c.offset[1]);
      };
      this.#resizer.onMouseDown = (trackMouse) => {
        const b = { x: 0, y: 0 };
        b[dx] = this.pos;
        const drag = dragMove(this.screen, b);
        trackMouse({
          move: () => {
            drag();
            this.pos = b[dx];
            this.screen.layoutTree(this);
          },
        });
      };
      this.addChild(this.#resizer, 1);
    }

    const steps = [this.pos, this[dw] - this.pos];
    if (this.resizable) {
      steps[1] -= this.dividerWidth;
      steps.splice(1, 0, this.dividerWidth);
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
  };

}

class StackBox extends Box {



}


const split = new SplitBox();
split.w = 320;
split.h = 180;
split.pos = 10;
split.dir = 'y';

const red = new BorderBox(); red.background = 0x330000ff; //red.border = 0xffffff33;
const green = new BorderBox(); green.background = 0x003300ff; //green.border = 0xffffff33;
const blue = new BorderBox(); blue.background = 0x000033ff; //blue.border = 0xffffff33;

const split2 = new SplitBox();
split2.resizable = true;
split2.pos = 30;
split2.dir = 'x';

screen.root.addChild(split);

split.addChild(blue);
split.addChild(split2);

split2.addChild(red);
split2.addChild(green);

split.resizable = true;

screen.layoutTree();

// setInterval(() => {

//   split2.resizable = !split2.resizable
//   screen.layout(split2);

//   console.log(split2.children)

// }, 2000);

// setInterval(() => {

//   split2.pos++;
//   screen.layout(split2);

// }, 100);
