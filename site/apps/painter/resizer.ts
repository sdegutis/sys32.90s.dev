import { sys } from "../../os/core/system.js";
import { View } from "../../os/core/view.js";
import { dragResize } from "../../os/util/selections.js";
import type { PaintView } from "./paintview.js";

export class ResizerView extends View {

  previousSibling<T extends View>() {
    if (!this.parent) return null;
    const i = this.parent.children.indexOf(this);
    if (i < 1) return null;
    return this.parent.children[i - 1] as T;
  }

  override layout() {
    const paintView = this.previousSibling()!;
    this.x = paintView.w;
    this.y = paintView.h;
  };

  override onMouseDown() {
    const paintView = this.previousSibling<PaintView>()!;
    const o = { w: paintView.w, h: paintView.h };
    const fn = dragResize(o);

    sys.trackMouse({
      move: () => {
        fn();
        const w = Math.floor(o.w / paintView.zoom);
        const h = Math.floor(o.h / paintView.zoom);
        paintView.resize(w, h);
      }
    })
  }

}
