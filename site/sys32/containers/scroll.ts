import { View } from "../core/view.js";

export class Scroll extends View {

  sx = 0;
  sy = 0;
  amount = 6;

  override layout(): void {
    if (!this.firstChild) return;

    this.#adjust();
    this.firstChild.x = -this.sx;
    this.firstChild.y = -this.sy;
  }

  override onScroll(up: boolean): void {
    const sy = this.sys.keys['Shift'] ? 'sx' : 'sy';
    this[sy] += up ? -this.amount : this.amount;

    this.#adjust();
    this.sys.layoutTree(this);
  }

  #adjust() {
    if (!this.firstChild) return;

    this.sx = Math.max(0, Math.min(this.firstChild.w - this.w, this.sx));
    this.sy = Math.max(0, Math.min(this.firstChild.h - this.h, this.sy));
  }

}
