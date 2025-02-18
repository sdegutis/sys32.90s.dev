import { Box } from "./box.js";

export function vacuumLayout(this: Box) {
  this.children[0].x = 0;
  this.children[0].y = 0;
  this.children[0].w = this.w;
  this.children[0].h = this.h;
};

export function makeFlowLayout(padding = 0, margin = 0) {
  return function (this: Box) {
    let x = padding;
    let y = padding;
    let h = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (x + child.w >= this.w) {
        x = padding;
        y += h + margin;
      }

      child.x = x;
      child.y = y;
      x += child.w + margin;
      if (child.h > h) h = child.h;
    }
  };
}
