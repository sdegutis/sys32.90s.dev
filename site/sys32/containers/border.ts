import { View } from "../core/view.js";

export class Border extends View {

  u = 0;
  d = 0;
  l = 0;
  r = 0;

  set size(n: number) { this.u = this.d = this.l = this.r = n; }

  override adjust(): void {
    this.w = this.l + (this.firstChild?.w ?? 0) + this.r;
    this.h = this.u + (this.firstChild?.h ?? 0) + this.d;
  }

  override layout(): void {
    const c = this.firstChild;
    if (c) {
      c.x = this.l;
      c.y = this.u;
    }
  }

}
