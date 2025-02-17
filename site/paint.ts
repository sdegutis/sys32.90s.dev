import { Box, Screen, TileSelection, dragMove, dragResize } from "./crt.js";

const screen = new Screen(document.querySelector('canvas')!);
screen.autoscale();

class BorderBox extends Box {

  border = 0xffffff33;

  draw = () => {
    this.screen.rectLine(0, 0, this.w, this.h, this.border);
  };

}

class VacuumBox extends Box {

  layout(): void {
    this.children[0].x = this.x;
    this.children[0].y = this.y;
    this.children[0].w = this.w;
    this.children[0].h = this.h;
    super.layout();
  }

}

class SplitBox extends Box {

  pos = 0;
  dir: 'x' | 'y' = 'y';
  resizable = false;
  dividerWidth = 2;
  dividerColor = 0xaaaaaaff;

  #resizer?: Box;

  layout(): void {

    const dw = this.dir === 'x' ? 'w' : 'h';
    const dx = this.dir;

    if (!this.resizable && this.#resizer) {
      this.#resizer = undefined;
    }
    else if (this.resizable && !this.#resizer) {
      this.#resizer = new Box();
      this.#resizer.background = this.dividerColor;
      this.children.splice(1, 0, this.#resizer);
      this.#resizer.screen = this.screen;
      this.#resizer.onMouseDown = () => {
        const b = { x: 0, y: 0 };
        b[dx] = this.pos;

        const move = dragMove(this.screen, b);
        this.screen.trackMouse({
          move: () => {
            move();
            this.pos = b[dx];
            this.layout();
          },
        });
      };
      // this.add(this.#resizer);
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

    super.layout();
  }

}

class StackBox extends Box {



}

const v = new VacuumBox();
v.w = 320;
v.h = 180;

const split = new SplitBox();
split.pos = 10;
split.dir = 'y';

const red = new BorderBox(); red.background = 0x330000ff; //red.border = 0xffffff33;
const green = new BorderBox(); green.background = 0x003300ff; //green.border = 0xffffff33;
const blue = new BorderBox(); blue.background = 0x000033ff; //blue.border = 0xffffff33;

const split2 = new SplitBox();
split2.resizable = true;
split2.pos = 30;
split2.dir = 'x';

screen.root.add(v);

v.add(split);

split.add(blue);
split.add(split2);

split2.add(red);
split2.add(green);

screen.root.layout();
