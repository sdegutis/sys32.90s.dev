import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedXB, PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { Spaced } from "../sys32/containers/spaced.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { Cursor, System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { makeFlowLayout } from "../sys32/util/layouts.js";
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

  tool: 'pencil' | 'eraser' = 'pencil';

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
    if (this.tool === 'pencil' || this.tool === 'eraser') {
      this.sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / 4);
          const y = Math.floor(this.mouse.y / 4);
          const i = y * this.width + x;
          this.#grid[i] = this.tool === 'pencil' ? this.color : 0x00000000;
        }
      })
    }
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

  const colorLabel = sys.make(Label, {});

  function updateLabels() {
    widthLabel.text = paintView.width.toString();
    heightLabel.text = paintView.height.toString();
    sys.layoutTree(heightLabel.parent);
  }

  updateLabels();

  const resizer = sys.make(View, {
    background: 0x00000077,
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

  const toolRadios = new RadioGroup();

  const pencilTool = sys.make(RadioButton, { group: toolRadios, onSelected: () => { paintView.tool = 'pencil' } });
  const eraserTool = sys.make(RadioButton, { group: toolRadios, onSelected: () => { paintView.tool = 'eraser' } });

  toolRadios.select(pencilTool)

  const colorRadios = new RadioGroup();

  const colorField = sys.make(TextField, { length: 9, background: 0x111111ff, padding: 1 });
  const colorGroup = sys.make(View, {
    w: 36,
    background: 0x99000033,
    layout: makeFlowLayout(),
  },
    pencilTool,
    eraserTool,
    colorField,
  );

  colorField.onEnter = () => {
    const color = parseInt('0x' + colorField.text, 16);
    colorField.text = '';
    makeColorButton(color);
    sys.layoutTree(colorGroup.parent)
  };

  function makeColorButton(color: number) {
    const button = sys.make(ColorButton, {
      background: 0x99999933,
      color, group: colorRadios, size: 4, padding: 1,
      onSelected: () => {
        paintView.color = color;
        colorLabel.text = '0x' + color.toString(16).padStart(8, '0');
        sys.layoutTree(colorLabel.parent);
      }
    });
    colorGroup.addChild(button);

    if (!colorRadios.selected) colorRadios.select(button)
  }

  for (const color of COLORS) {
    makeColorButton(color);
  }

  const panel = sys.make(Panel, { title: 'paint', minw: 50, w: 180, h: 70 },

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

        sys.make(GroupX, {},
          sys.make(Label, { color: 0xffffff33, text: 'w:' }),
          widthLabel,
          sys.make(Label, { color: 0xffffff33, text: ' h:' }),
          heightLabel,
          sys.make(Label, { color: 0xffffff33, text: ' c:' }),
          colorLabel,
        )

      ),

      colorGroup,

    ),
  );

  sys.root.addChild(panel);
  sys.focus(panel);
}
