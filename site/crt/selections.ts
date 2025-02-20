import { Box } from "./box.js";
import { System } from "./system.js";

export class Selection {

  x1: number;
  y1: number;
  x!: number;
  y!: number;
  w!: number;
  h!: number;

  constructor(public box: Box) {
    this.x1 = this.box.mouse.x;
    this.y1 = this.box.mouse.y;
    this.update();
  }

  update() {
    const x2 = this.box.mouse.x;
    const y2 = this.box.mouse.y;
    this.x = this.x1 < x2 ? this.x1 : x2;
    this.y = this.y1 < y2 ? this.y1 : y2;
    this.w = (this.x1 < x2 ? x2 - this.x1 : this.x1 - x2) + 1;
    this.h = (this.y1 < y2 ? y2 - this.y1 : this.y1 - y2) + 1;
  }

}

export class TileSelection extends Selection {

  constructor(box: Box, public size: number) {
    super(box);
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

export function dragMove(sys: System, box: { x: number, y: number }) {
  const startPos = { x: box.x, y: box.y };
  const offx = sys.mouse.x - startPos.x;
  const offy = sys.mouse.y - startPos.y;
  return () => {
    const diffx = sys.mouse.x - startPos.x;
    const diffy = sys.mouse.y - startPos.y;
    box.x = startPos.x + diffx - offx;
    box.y = startPos.y + diffy - offy;
  };
}

export function dragResize(sys: System, box: { w: number, h: number }) {
  const startSize = { w: box.w, h: box.h };
  const offx = sys.mouse.x - startSize.w;
  const offy = sys.mouse.y - startSize.h;
  return () => {
    const diffx = sys.mouse.x - startSize.w;
    const diffy = sys.mouse.y - startSize.h;
    box.w = startSize.w + diffx - offx;
    box.h = startSize.h + diffy - offy;
  };
}
