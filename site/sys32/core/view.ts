import { Panel } from "./panel.js";
import { Cursor, System } from "./system.js";

type Mouse = {
  x: number;
  y: number;
  cursor: Cursor | undefined;
};

export class View {

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

  x = 0;
  y = 0;
  w = 0;
  h = 0;
  background = 0x00000000;
  passthrough = false;
  visible = true;
  focused = false;

  children: View[] = [];
  mouse: Mouse = { x: 0, y: 0, cursor: undefined };

  trackingArea?: { x: number, y: number, w: number, h: number };

  panel!: Panel;
  sys: System;

  constructor(sys: System) {
    this.sys = sys;
    this.panel = this.sys.root;
  }

  get firstChild(): View | undefined { return this.children[0]; }
  get lastChild(): View | undefined { return this.children[this.children.length - 1]; }

}
