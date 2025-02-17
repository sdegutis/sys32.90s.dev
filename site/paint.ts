import { Box, Screen, TileSelection, dragMove, dragResize } from "./crt.js";

const screen = new Screen(document.querySelector('canvas')!);
screen.autoscale();

class BorderBox extends Box {

  border = 0x000000ff;

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

  layout(): void {
    this.children[0].x = 0;
    this.children[0].y = 0;
    this.children[0].w = this.w;
    this.children[0].h = this.h;

    this.children[1].x = 0;
    this.children[1].y = 0;
    this.children[1].w = this.w;
    this.children[1].h = this.h;

    if (this.dir === 'x') {
      this.children[0].w = this.pos;
      this.children[1].x = this.pos;
      this.children[1].w -= this.pos;
    }
    else {
      this.children[0].h = this.pos;
      this.children[1].y = this.pos;
      this.children[1].h -= this.pos;
    }
    super.layout();
  }

}

const v = new VacuumBox();
v.w = 320;
v.h = 180;

const split = new SplitBox();
split.pos = 10;
split.dir = 'y';

const red = new BorderBox(); red.background = 0x330000ff; red.border = 0xffffff33;
const green = new BorderBox(); green.background = 0x003300ff; green.border = 0xffffff33;
const blue = new BorderBox(); blue.background = 0x000033ff; blue.border = 0xffffff33;

const split2 = new SplitBox();
split2.pos = 30;
split2.dir = 'x';

screen.root.add(v);

v.add(split);

split.add(blue);
split.add(split2);

split2.add(red);
split2.add(green);

screen.root.layout();
