import { Box } from "./box.js";

export function makeVacuumLayout(padding = 0) {
  return function (this: Box) {
    const c = this.children[0];
    if (c) {
      c.x = padding;
      c.y = padding;
      c.w = this.w - padding * 2;
      c.h = this.h - padding * 2;
    }
  };
};

export function centerLayout(this: Box) {
  const c = this.children[0];
  if (c) {
    c.x = Math.round(this.w / 2 - c.w / 2);
    c.y = Math.round(this.h / 2 - c.h / 2);
  }
};

// export function makeFlowLayout(padding = 0, gap = 0) {
//   return function (this: Box) {
//     let x = padding;
//     let y = padding;
//     let h = 0;
//     for (let i = 0; i < this.children.length; i++) {
//       const child = this.children[i];

//       if (x + child.w > this.w && i > 0) {
//         x = padding;
//         y += h + gap;
//         h = 0;
//       }

//       child.x = x;
//       child.y = y;
//       x += child.w + gap;
//       if (child.h > h) h = child.h;
//     }
//   };
// }
