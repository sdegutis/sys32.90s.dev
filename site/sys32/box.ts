import { Cursor } from "./cursor.js";
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
  layout?(w: number, h: number): void;
  adjust?(): void;
  cursor?: Cursor;

  x = 0;
  y = 0;
  w = 0;
  h = 0;
  background = 0x00000000;
  passthrough = false;
  visible = true;
  focused = false;

  children: Box[] = [];
  mouse = { x: 0, y: 0 };
  trackingArea?: { x: number, y: number, w: number, h: number };

  constructor(public sys: System) { }

  get firstChild() { return this.children[0]; }
  get lastChild() { return this.children[this.children.length - 1]; }

}
