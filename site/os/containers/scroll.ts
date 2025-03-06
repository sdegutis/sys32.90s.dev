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

  scrollVisibleClaims = 0;
  cancelTracker?: () => void;
  cancelClaim?: ReturnType<typeof setTimeout>;

  override init(): void {
    this.addChild(this.barx);
    this.addChild(this.bary);

    this.barx.onMouseEntered = () => this.scrollVisibleClaims++;
    this.bary.onMouseEntered = () => this.scrollVisibleClaims++;
    this.barx.onMouseExited = () => this.scrollVisibleClaims--;
    this.bary.onMouseExited = () => this.scrollVisibleClaims--;

    this.$data.scrollVisibleClaims.watch((claims) => {
      this.barx.visible = (claims > 0) && (this.firstChild!.h > this.h);
      this.bary.visible = (claims > 0) && (this.firstChild!.w > this.w);
    })

    this.$data.w.watch(() => this.adjustTracks());
    this.$data.h.watch(() => this.adjustTracks());
    this.$data.scrollx.watch(() => this.adjustTracks());
    this.$data.scrolly.watch(() => this.adjustTracks());
  }

  private adjustTracks() {
    const contentView = this.firstChild!;

    const py = Math.min(1, this.h / contentView.h);
    this.trackx.y = Math.round(this.scrolly / (contentView.h - this.h) * this.barx.h * (1 - py));
    this.trackx.h = Math.round(this.barx.h * py);

    const px = Math.min(1, this.w / contentView.w);
    this.tracky.x = Math.round(this.scrollx / (contentView.w - this.w) * this.bary.w * (1 - px));
    this.tracky.w = Math.round(this.bary.w * px);
  }

  private dragTrack(track: View) {
    this.scrollVisibleClaims++;

    const o = { y: this.trackx.y, x: this.tracky.x };
    const drag = dragMove(o);
    const move = () => {
      drag();

      if (track === this.trackx) this.trackx.y = o.y;
      if (track === this.tracky) this.tracky.x = o.x;

      // this.scrolly = Math.round((this.trackx.y / (this.barx.h - this.trackx.h)) * this.firstChild!.h);

      // console.log(this.scrolly)



      // // this.scrolly = o.y;
      // // this.scrollx = o.x;
      // this.fixScrollPos();
      // this.layoutTree();
    }
    const up = () => {
      setTimeout(() => { this.scrollVisibleClaims-- }, 500);
    };
    sys.trackMouse({ move, up });
  }

  override onMouseEntered(): void {
    this.cancelTracker = sys.trackMouse({
      autostop: false,
      move: () => {
        if (this.cancelClaim) clearTimeout(this.cancelClaim);
        else this.scrollVisibleClaims++;
        setTimeout(() => { this.scrollVisibleClaims-- }, 500);
      }
    });
  }

  override onMouseExited(): void {
    this.cancelTracker?.();
    delete this.cancelTracker;
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
    this.scrollVisibleClaims++;
    setTimeout(() => this.scrollVisibleClaims--, 500);

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
