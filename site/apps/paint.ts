import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { TextField } from "../sys32/controls/textfield.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { dragMove, dragResize } from "../sys32/util/selections.js";

class PaintView extends View {

  width = 10;
  height = 10;

  override background = 0xffffff33;

  #grid: number[] = [];

  override adjust(): void {
    this.w = this.width * 4;
    this.h = this.height * 4;
  }

  override draw(): void {
    for (let x = 0; x < this.width; x++) {
      this.sys.crt.rectFill(x * 4, 0, 1, this.h, 0x00000033);
    }
    for (let y = 0; y < this.height; y++) {
      this.sys.crt.rectFill(0, y * 4, this.w, 1, 0x00000033);
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        const c = this.#grid[i];
        if (c !== undefined) {
          const px = x * 4;
          const py = y * 4;
          this.sys.crt.rectFill(px, py, 4, 4, c);
        }
      }
    }

    const px = Math.floor(this.mouse.x / 4) * 4;
    const py = Math.floor(this.mouse.y / 4) * 4;
    this.sys.crt.rectFill(px, py, 4, 4, 0x0000ff77);
  }

  override onMouseDown(): void {
    this.sys.trackMouse({
      move: () => {
        const x = Math.floor(this.mouse.x / 4);
        const y = Math.floor(this.mouse.y / 4);
        const i = y * this.width + x;
        this.#grid[i] = 0xffffffff;
      }
    })
  }

  resize(width: number, height: number) {
    const oldgrid = [...this.#grid];
    const oldwidth = this.width;

    this.width = width;
    this.height = height;
    this.#grid.length = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = oldgrid[y * oldwidth + x];
        if (c !== undefined) this.#grid[y * width + x] = c;
      }
    }

    this.sys.layoutTree(this.parent);
  }

}

export default function paint(sys: System) {
  const paintView = sys.make(PaintView, {});

  const widthLabel = sys.make(Label, { text: paintView.width.toString() });
  const heightLabel = sys.make(Label, { text: paintView.height.toString() });

  const resizer = sys.make(View, {
    background: 0x77000077,
    w: 4, h: 4,
    layout: () => {
      resizer.x = paintView.w;
      resizer.y = paintView.h;
    },
    onMouseDown() {
      const o = { w: paintView.w, h: paintView.h };
      const fn = dragResize(sys, o);

      this.sys?.trackMouse({
        move: () => {
          fn();
          const w = Math.floor(o.w / 4);
          const h = Math.floor(o.h / 4);
          paintView.resize(w, h);

          widthLabel.text = paintView.width.toString();
          heightLabel.text = paintView.height.toString();
        }
      })

    }
  });

  const panel = sys.make(Panel, { title: 'paint' },
    sys.make(PanedYB, {},

      sys.make(Scroll, {
        background: 0x222222ff,
        draw() {
          let off = 0;
          const w = 4;
          const h = 3;
          for (let y = 0; y < this.h!; y++) {
            for (let x = 0; x < this.w!; x += w) {
              sys.crt.pset(off + x, y, 0x272727ff);
            }
            if (y % h === (h - 1)) off = (off + 1) % w;
          }
        },
      },
        paintView,
        resizer
      ),

      sys.make(GroupX, {},
        widthLabel,
        heightLabel,
      )

    )

    // sys.make(PanedYB, {},
    //   sys.make(View, { background: 0x111111ff }),
    //   sys.make(GroupY, { background: 0x0000ff33 },
    //     sys.make(View, { h: 3, background: 0x00ff00ff }),
    //     sys.make(GroupX, {},

    //       sys.make(Label, { text: 'w:' }),
    //       widthLabel,

    //       sys.make(Label, { text: 'h:' }),
    //       heightLabel,

    //       sys.make(Button, {
    //         padding: 2,
    //         onClick: () => {
    //           console.log('hey')
    //         }
    //       }, sys.make(Label, { text: 'resize' }))
    //     ),
    //   )
    // )
  )

  sys.root.addChild(panel);
  sys.focus(panel);
}
