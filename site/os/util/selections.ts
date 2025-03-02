import { sys } from "../core/system.js";
import { View } from "../core/view.js";

export class Selection {

  view: View;

  ox: number;
  oy: number;
  x1: number;
  y1: number;
  x!: number;
  y!: number;
  w!: number;
  h!: number;

  constructor(view: View) {
    this.view = view;
    this.x1 = this.view.mouse.x;
    this.y1 = this.view.mouse.y;
    this.ox = sys.mouse.x - this.x1;
    this.oy = sys.mouse.y - this.y1;
    this.update();
  }

  update() {
    const x2 = sys.mouse.x - this.ox;
    const y2 = sys.mouse.y - this.oy;
    this.x = this.x1 < x2 ? this.x1 : x2;
    this.y = this.y1 < y2 ? this.y1 : y2;
    this.w = (this.x1 < x2 ? x2 - this.x1 : this.x1 - x2) + 1;
    this.h = (this.y1 < y2 ? y2 - this.y1 : this.y1 - y2) + 1;
  }

}

export class TileSelection extends Selection {

  size: number;

  constructor(view: View, size: number) {
    super(view);
    this.size = size;
  }

  tx1!: number;
  ty1!: number;
  tx2!: number;
  ty2!: number;

  override update() {
    super.update();
    this.tx1 = Math.floor(this.x / this.size);
    this.ty1 = Math.floor(this.y / this.size);
    this.tx2 = Math.ceil(this.x / this.size + this.w / this.size);
    this.ty2 = Math.ceil(this.y / this.size + this.h / this.size);
  }

}

export function dragMove(view: { x: number, y: number }) {
  const startPos = { x: view.x, y: view.y };
  const offx = sys.mouse.x - startPos.x;
  const offy = sys.mouse.y - startPos.y;
  return () => {
    const diffx = sys.mouse.x - startPos.x;
    const diffy = sys.mouse.y - startPos.y;
    view.x = startPos.x + diffx - offx;
    view.y = startPos.y + diffy - offy;
    return { x: diffx - offx, y: diffy - offy };
  };
}

export function dragResize(view: { w: number, h: number }) {
  const startSize = { w: view.w, h: view.h };
  const offx = sys.mouse.x - startSize.w;
  const offy = sys.mouse.y - startSize.h;
  return () => {
    const diffx = sys.mouse.x - startSize.w;
    const diffy = sys.mouse.y - startSize.h;
    view.w = startSize.w + diffx - offx;
    view.h = startSize.h + diffy - offy;
    return { w: diffx - offx, h: diffy - offy };
  };
}
