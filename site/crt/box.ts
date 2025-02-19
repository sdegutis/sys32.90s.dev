import { Bitmap } from "./bitmap.js";
import { Screen } from "./screen.js";

export class Box {

  onScroll?(up: boolean): void;
  onKeyDown?(key: string): void;
  onMouseDown?(trackMouse: MouseTracker): void;
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

  children: Box[] = [];
  hovered = false;
  mouse = { x: 0, y: 0 };
  trackingArea?: { x: number, y: number, w: number, h: number };

  constructor(public screen: Screen) { }

  drawCursor(x: number, y: number) {
    pointer.draw(this.screen, x - 1, y - 1);
  }

}

export class BorderBox extends Box {

  border = 0xffffff33;

  padding = 2;

  override draw(): void {
    if ((this.border & 0x000000ff) > 0) {
      this.screen.rectLine(0, 0, this.w, this.h, this.border);
    }
  }

}

export type MouseTracker = (fns: {
  move: () => void;
  up?: () => void;
}) => () => void;

const pointer = new Bitmap([0x00000099, 0xffffffff], [
  1, 1, 1, 1, -1,
  1, 2, 2, 1, -1,
  1, 2, 1, 1, -1,
  1, 1, 1, -1,
]);
