import { Bitmap } from "./bitmap.js";
import { System } from "./system.js";

export class Box {

  onScroll?(up: boolean): void;
  onKeyDown?(key: string): void;
  onMouseDown?(): void;
  onMouseMove?(): void;
  onMouseEnter?(): void;
  onMouseExit?(): void;
  onFocus?(): void;
  onBlur?(): void;
  draw?(): void;

  /** Move/resize children. */
  layout?(): void;

  /** Resize self. */
  adjust?(): void;

  x = 0;
  y = 0;
  w = 0;
  h = 0;
  background = 0x00000000;
  passthrough = false;
  visible = true;
  focused = false;
  padding = 0;

  children: Box[] = [];
  // hovered = false;
  mouse = { x: 0, y: 0 };
  trackingArea?: { x: number, y: number, w: number, h: number };

  constructor(public sys: System) { }

  get firstChild() { return this.children[0]; }
  get lastChild() { return this.children[this.children.length - 1]; }

  drawCursor(x: number, y: number) {
    pointer.draw(this.sys, x - 1, y - 1);
  }

}

export class BorderBox extends Box {

  border = 0xffffff33;

  override padding = 2;

  override draw(): void {
    if ((this.border & 0x000000ff) > 0) {
      this.sys.rectLine(0, 0, this.w, this.h, this.border);
    }
  }

}

const pointer = new Bitmap([0x000000cc, 0xffffffff], [
  1, 1, 1, 1, -1,
  1, 2, 2, 1, -1,
  1, 2, 1, 1, -1,
  1, 1, 1, -1,
]);
