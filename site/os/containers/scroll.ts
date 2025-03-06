import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";

export class Scroll extends View {

  scrollx = 0;
  scrolly = 0;
  amount = 6;

  barx = $(View, { w: 3, background: 0x770000cc });
  bary = $(View, { h: 3, background: 0x770000cc });

  override init(): void {
    this.addChild(this.barx);
    this.addChild(this.bary);

    this.barx.$data.visible = this.$data.hovered;
    this.bary.$data.visible = this.$data.hovered;
  }

  override layout(): void {
    if (!this.firstChild) return;

    this._adjust();
    this.firstChild.x = -this.scrollx;
    this.firstChild.y = -this.scrolly;

    this.barx.x = this.w - this.barx.w;
    this.barx.y = 0;
    this.barx.h = this.h;

    this.bary.y = this.h - this.bary.h;
    this.bary.x = 0;
    this.bary.w = this.w;
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
