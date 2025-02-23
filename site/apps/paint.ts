import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedXB, PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { Spaced } from "../sys32/containers/spaced.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { Cursor, System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { dragResize } from "../sys32/util/selections.js";

class ColorButton extends RadioButton {

  color = 0x00000000;

  override draw(): void {
    this.sys.crt.rectFill(this.padding, this.padding, this.size, this.size, this.color);

    if (this.checked) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, this.checkColor);
    }
    else if (this.hovered) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, 0xffffff77);
    }
  }

}

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];

class PaintView extends View {

  width = 10;
  height = 10;

  color = 0xffffffff;

  override background = 0xffffff33;
  override cursor: Cursor = { bitmap: new Bitmap([], 0, []), offset: [0, 0] };

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

    if (this.#hovered) {
      const px = Math.floor(this.mouse.x / 4) * 4;
      const py = Math.floor(this.mouse.y / 4) * 4;
      this.sys.crt.rectFill(px, py, 4, 4, 0x0000ff77);
    }
  }

  override onMouseDown(): void {
    this.sys.trackMouse({
      move: () => {
        const x = Math.floor(this.mouse.x / 4);
        const y = Math.floor(this.mouse.y / 4);
        const i = y * this.width + x;
        this.#grid[i] = this.color;
      }
    })
  }

  resize(width: number, height: number) {
    const oldgrid = [...this.#grid];
    const oldwidth = this.width;
    const oldheight = this.height;

    this.width = width;
    this.height = height;
    this.#grid.length = 0;

    for (let y = 0; y < Math.min(height, oldheight); y++) {
      for (let x = 0; x < Math.min(width, oldwidth); x++) {
        const c = oldgrid[y * oldwidth + x];
        if (c !== undefined) this.#grid[y * width + x] = c;
      }
    }

    this.sys.layoutTree(this.parent);
  }

  #hovered = false;

  override onMouseEnter(): void {
    super.onMouseEnter?.();
    this.#hovered = true;
  }

  override onMouseExit(): void {
    super.onMouseExit?.();
    this.#hovered = false;
  }

}

export default function paint(sys: System) {
  const paintView = sys.make(PaintView, {});
  const widthLabel = sys.make(Label, {});
  const heightLabel = sys.make(Label, {});

  function updateLabels() {
    widthLabel.text = paintView.width.toString();
    heightLabel.text = paintView.height.toString();
    sys.layoutTree(heightLabel.parent);
  }

  updateLabels();

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
          updateLabels();
        }
      })

    }
  });

  const colorRadios = new RadioGroup();

  // colorRadios.onChange = () => {
  //   colorRadios.selected
  // }

  function addColor() {
    console.log('add color')
  }

  const colorGroup = sys.make(GroupY, { gap: -2 },
    sys.make(Button, { onClick: addColor }, sys.make(Label, { text: '+' }),),
  );

  for (const color of COLORS) {
    const b = sys.make(ColorButton, {
      color, group: colorRadios, size: 4, padding: 1,
      onSelected: () => { paintView.color = color; }
    });
    colorGroup.addChild(b);
  }


  const panel = sys.make(Panel, { title: 'paint', minw: 50, w: 80, h: 70 },

    sys.make(PanedXB, { gap: 1 },

      sys.make(PanedYB, { gap: 1 },

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

        sys.make(Spaced, { dir: 'x' },
          sys.make(GroupX, {},
            sys.make(Label, { color: 0xffffff33, text: 'w:' }),
            widthLabel,
            sys.make(Label, { color: 0xffffff33, text: '  h:' }),
            heightLabel,
          ),
          sys.make(Label, { text: 'hm' })
        )

      ),



      colorGroup,
    ),



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
