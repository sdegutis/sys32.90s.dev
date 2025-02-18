import { Box } from "./box.js";

export function vacuumLayout(this: Box) {
  const c = this.children[0];
  c.x = 0;
  c.y = 0;
  c.w = this.w;
  c.h = this.h;
};

export function centerLayout(this: Box) {
  const c = this.children[0];
  c.x = Math.round(this.w / 2 - c.w / 2);
  c.y = Math.round(this.h / 2 - c.h / 2);
};

export function makeFlowLayout(padding = 0, margin = 0) {
  return function (this: Box) {
    let x = padding;
    let y = padding;
    let h = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (x + child.w > this.w && i > 0) {
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
