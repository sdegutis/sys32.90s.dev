import { Box, MouseTracker } from "./box.js";
import { Screen } from "./screen.js";

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

export function dragMove(screen: Screen, el: { x: number, y: number }) {
  const startMouse = { x: screen.mouse.x, y: screen.mouse.y };
  const startElPos = { x: el.x, y: el.y };
  return () => {
    const offx = startMouse.x - startElPos.x;
    const offy = startMouse.y - startElPos.y;
    const diffx = screen.mouse.x - startElPos.x;
    const diffy = screen.mouse.y - startElPos.y;
    el.x = startElPos.x + diffx - offx;
    el.y = startElPos.y + diffy - offy;
  };
}

export function dragResize(screen: Screen, el: { w: number, h: number }) {
  const startMouse = { x: screen.mouse.x, y: screen.mouse.y };
  const startElPos = { w: el.w, h: el.h };
  return () => {
    const offx = startMouse.x - startElPos.w;
    const offy = startMouse.y - startElPos.h;
    const diffx = screen.mouse.x - startElPos.w;
    const diffy = screen.mouse.y - startElPos.h;
    el.w = startElPos.w + diffx - offx;
    el.h = startElPos.h + diffy - offy;
  };
}

export function dragBox(track: MouseTracker, box: Box) {
  const move = dragMove(box.screen, box);
  track({ move });
}
