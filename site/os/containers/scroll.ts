import { sys } from "../core/system.js";
import { View } from "../core/view.js";

export class Scroll extends View {

  scrollx = 0;
  scrolly = 0;
  amount = 6;

  override layout(): void {
    if (!this.firstChild) return;

    this._adjust();
    this.firstChild.x = -this.scrollx;
    this.firstChild.y = -this.scrolly;
  }

  override onScroll(up: boolean): void {
    const sy = sys.keys['Shift'] ? 'scrollx' : 'scrolly';
    this[sy] += up ? -this.amount : this.amount;

    this._adjust();
    this.layoutTree();
  }

  private _adjust() {
    if (!this.firstChild) return;

    this.scrollx = Math.max(0, Math.min(this.firstChild.w - this.w, this.scrollx));
    this.scrolly = Math.max(0, Math.min(this.firstChild.h - this.h, this.scrolly));
  }

}
