import { View } from "../core/view.js";

export class Scroll extends View {

  sx = 0;
  sy = 0;

  override layout(): void {
    this.#adjust();
    this.firstChild!.x = -this.sx;
    this.firstChild!.y = -this.sy;
  }

  override onScroll(up: boolean): void {
    const n = 6;
    const sy = this.sys.keys['Shift'] ? 'sx' : 'sy';
    this[sy] += up ? -n : n;

    this.#adjust();
    this.sys.layoutTree(this);
  }

  #adjust() {
    this.sx = Math.max(0, Math.min(this.firstChild!.w - this.w, this.sx));
    this.sy = Math.max(0, Math.min(this.firstChild!.h - this.h, this.sy));
  }

}
