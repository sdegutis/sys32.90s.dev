import { Bitmap } from "./bitmap.js";
import { Screen } from "./screen.js";

const cursors = {

  pointer: new Bitmap([0x00000099, 0xffffffff], [
    1, 1, 1, 1, -1,
    1, 2, 2, 1, -1,
    1, 2, 1, 1, -1,
    1, 1, 1, -1,
  ]),

};

export class Box {

  onScroll?(up: boolean): void;
  onKeyDown?(key: string): void;
  onMouseDown?(trackMouse: MouseTracker): void;
  onMouseMove?(): void;
  onMouseEnter?(): void;
  onMouseExit?(): void;
  onFocus?(): void;
  onUnfocus?(): void;
  draw?(): void;
  layout?(): void;

  x = 0;
  y = 0;
  w = 0;
  h = 0;

  background = 0x00000000;

  children: Box[] = [];
  hovered = false;
  mouse = { x: 0, y: 0 };
  passthrough = false;
  trackingArea?: { x: number, y: number, w: number, h: number };

  constructor(public screen: Screen) { }

  drawCursor(x: number, y: number) {
    cursors.pointer.draw(this.screen, x - 1, y - 1);
  }

}

export type MouseTracker = (fns: {
  move: () => void;
  up?: () => void;
}) => () => void;
