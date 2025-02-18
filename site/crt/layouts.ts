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
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.x = x;
      child.y = y;
      x += child.w + margin;
    }
  };
}
