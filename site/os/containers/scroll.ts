import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { dragMove } from "../util/selections.js";

export class Scroll extends View {

  scrollx = 0;
  scrolly = 0;
  amount = 6;

  trackx = $(View, { w: 3, background: 0xffffff22, onMouseDown: () => this.dragTrack(this.trackx) });
  tracky = $(View, { h: 3, background: 0xffffff22, onMouseDown: () => this.dragTrack(this.tracky) });

  barx = $(View, { w: 3, background: 0x00000099 }, this.trackx);
  bary = $(View, { h: 3, background: 0x00000099 }, this.tracky);

  hoveredAny = false;

  override init(): void {
    this.addChild(this.barx);
    this.addChild(this.bary);

    this.barx.$data.visible = this.$data.hoveredAny;
    this.bary.$data.visible = this.$data.hoveredAny;

    this.$data.w.watch(() => this.adjustTracks());
    this.$data.h.watch(() => this.adjustTracks());
    this.$data.scrollx.watch(() => this.adjustTracks());
    this.$data.scrolly.watch(() => this.adjustTracks());
  }

  private adjustTracks() {
    const content = this.firstChild!;

    const py = Math.min(1, this.h / content.h);
    this.trackx.y = Math.round(this.scrolly / (content.h - this.h) * this.barx.h * (1 - py));
    this.trackx.h = Math.round(this.barx.h * py);

    const px = Math.min(1, this.w / content.w);
    this.tracky.x = Math.round(this.scrollx / (content.w - this.w) * this.bary.w * (1 - px));
    this.tracky.w = Math.round(this.bary.w * px);
  }

  private dragTrack(track: View) {
    const o = { x: this.scrollx, y: this.scrolly };
    const drag = dragMove(o);
    const move = () => {
      drag();
      if (track === this.trackx) this.scrolly = o.y;
      if (track === this.tracky) this.scrollx = o.x;
      this.fixScrollPos();
      this.layoutTree();
    }
    sys.trackMouse({ move })
  }

  override onMouseEntered(): void {
    this.hoveredAny = true;
  }

  override onMouseExited(): void {
    this.hoveredAny = false;
  }

  override layout(): void {
    if (!this.firstChild) return;

    this.fixScrollPos();
    this.firstChild.x = -this.scrollx;
    this.firstChild.y = -this.scrolly;

    this.barx.x = this.w - this.barx.w;
    this.barx.y = 0;
    this.barx.h = this.h - this.bary.h;

    this.bary.y = this.h - this.bary.h;
    this.bary.x = 0;
    this.bary.w = this.w - this.barx.w;

    this.trackx.x = 0;
    this.trackx.w = this.barx.w;

    this.tracky.y = 0;
    this.tracky.h = this.bary.h;

    this.adjustTracks();
  }

  override onScroll(up: boolean): void {
    const sy = sys.keys['Shift'] ? 'scrollx' : 'scrolly';
    this[sy] += up ? -this.amount : this.amount;

    this.fixScrollPos();
    this.layoutTree();
  }

  private fixScrollPos() {
    if (!this.firstChild) return;

    this.scrollx = Math.max(0, Math.min(this.firstChild.w - this.w, this.scrollx));
    this.scrolly = Math.max(0, Math.min(this.firstChild.h - this.h, this.scrolly));
  }

}
