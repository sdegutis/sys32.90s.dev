import { GroupX } from "../sys32/containers/group.js";
import { PanedXB, PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { Spaced } from "../sys32/containers/spaced.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { Cursor, System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { multifn } from "../sys32/util/events.js";
import { makeFlowLayout } from "../sys32/util/layouts.js";
import { dragMove, dragResize } from "../sys32/util/selections.js";
import { makeStripeMotifDraw } from "./util/motif.js";

class Reactable<T> {

  #data;
  #changed = multifn<T>();

  constructor(data: T) {
    this.#data = data;
  }

  get val() { return this.#data; }
  set val(data: T) {
    this.#data = data;
    this.#changed(data);
  }

  watch(fn: (data: T) => void) {
    const done = this.#changed.watch(fn);
    this.#changed(this.val);
    return done;
  }

}

export default function paint(sys: System) {
  const zoom = new Reactable(4);
  const size = new Reactable({ w: 10, h: 10 });

  const paintView = sys.make(PaintView, {});

  const widthLabel = sys.make(Label, {});
  const heightLabel = sys.make(Label, {});

  const colorLabel = sys.make(Label, {});
  const zoomLabel = sys.make(Label, {});

  size.watch(s => paintView.resize(s.w, s.h));
  size.watch(s => widthLabel.text = s.w.toString());
  size.watch(s => heightLabel.text = s.h.toString());
  size.watch(s => sys.layoutTree(heightLabel.parent));

  zoom.watch(n => zoomLabel.text = n.toString());
  zoom.watch(n => paintView.zoom = n);

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
          const w = Math.floor(o.w / zoom.val);
          const h = Math.floor(o.h / zoom.val);
          size.val = { w, h };
        }
      })

    }
  });

  const toolRadios = new RadioGroup();

  const pencilTool = sys.make(RadioButton, { group: toolRadios, onSelected: () => { paintView.tool = 'pencil' } });
  const eraserTool = sys.make(RadioButton, { group: toolRadios, onSelected: () => { paintView.tool = 'eraser' } });

  toolRadios.select(pencilTool)

  const colorField = sys.make(TextField, { length: 9, background: 0x111111ff, padding: 1 });
  const toolArea = sys.make(View, {
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
    sys.layoutTree(toolArea.parent)
  };

  const colorRadios = new RadioGroup();

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
    toolArea.addChild(button);

    if (!colorRadios.selected) colorRadios.select(button)
  }

  for (const color of COLORS) {
    makeColorButton(color);
  }

  const statusBar = sys.make(Spaced, { dir: 'x' },
    sys.make(GroupX, {},
      sys.make(Label, { color: 0xffffff33, text: 'w:' }), widthLabel,
      sys.make(Label, { color: 0xffffff33, text: ' h:' }), heightLabel,
      sys.make(Label, { color: 0xffffff33, text: ' c:' }), colorLabel,
      sys.make(Label, { color: 0xffffff33, text: ' z:' }), zoomLabel,
    ),
    sys.make(GroupX, {},
      sys.make(Slider, {
        w: 20, h: 4, onChange() {
          zoom.val = this.val!;
          sys.layoutTree(panel);
        }
      })
    )
  );

  const paintArea = sys.make(Scroll, {
    background: 0x222222ff,
    draw: makeStripeMotifDraw(sys),
  },
    paintView,
    resizer
  );

  const panel = sys.make(Panel, {
    title: 'paint', minw: 50, w: 180, h: 70,
    onKeyDown(key) {
      if (key === 's' && sys.keys['Control']) {
        console.log('saving');
        return true;
      }
      return false;
    }
  },
    sys.make(PanedXB, { gap: 1 },
      sys.make(PanedYB, { gap: 1 },
        paintArea,
        statusBar
      ),
      toolArea,
    ),
  );

  sys.root.addChild(panel);
  sys.focus(panel);
}





class PaintView extends View {

  width = 10;
  height = 10;

  zoom = 4;

  color = 0xffffffff;

  tool: 'pencil' | 'eraser' = 'pencil';

  override background = 0xffffff33;
  override cursor: Cursor = { bitmap: new Bitmap([], 0, []), offset: [0, 0] };

  #grid: number[] = [];

  override adjust(): void {
    this.w = this.width * this.zoom;
    this.h = this.height * this.zoom;
  }

  override draw(): void {
    for (let x = 0; x < this.width; x++) {
      this.sys.crt.rectFill(x * this.zoom, 0, 1, this.h, 0x00000033);
    }
    for (let y = 0; y < this.height; y++) {
      this.sys.crt.rectFill(0, y * this.zoom, this.w, 1, 0x00000033);
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        const c = this.#grid[i];
        if (c !== undefined) {
          const px = x * this.zoom;
          const py = y * this.zoom;
          this.sys.crt.rectFill(px, py, this.zoom, this.zoom, c);
        }
      }
    }

    if (this.#hovered) {
      const px = Math.floor(this.mouse.x / this.zoom) * this.zoom;
      const py = Math.floor(this.mouse.y / this.zoom) * this.zoom;
      this.sys.crt.rectFill(px, py, this.zoom, this.zoom, 0x0000ff77);
    }
  }

  override onMouseDown(): void {
    if (this.tool === 'pencil' || this.tool === 'eraser') {
      this.sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / this.zoom);
          const y = Math.floor(this.mouse.y / this.zoom);
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

class Slider extends View {

  onChange?(): void;

  min = 1;
  max = 12;
  val = 3;

  knobSize = 2;
  lineSize = 1;

  override onMouseDown(): void {
    const o = { x: this.mouse.x, y: 0 };
    const fn = dragMove(this.sys, o);

    this.sys.trackMouse({
      move: () => {
        const oldval = this.val;

        fn();
        o.x = Math.max(0, Math.min(this.w, o.x));
        const p = o.x / this.w;
        this.val = Math.round((this.max - this.min) * p + this.min);

        if (this.val !== oldval) {
          this.onChange?.();
        }
      }
    });

  }

  override draw(): void {
    const y1 = Math.floor(this.h / 2);
    this.sys.crt.rectFill(0, y1, this.w, 1, 0xffffff33);
    const p = (this.val - this.min) / (this.max - this.min);
    const x = Math.floor(p * (this.w - this.knobSize));
    const y = Math.round(this.h / 2 - this.knobSize / 2);
    this.sys.crt.rectFill(x, y, 2, 2, 0xffffffff);
  }

}

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
