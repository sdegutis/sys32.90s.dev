import { Border } from "../sys32/containers/border.js";
import { GroupX } from "../sys32/containers/group.js";
import { PanedXB, PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { SpacedX } from "../sys32/containers/spaced.js";
import { makeButton } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { Slider } from "../sys32/controls/slider.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { Cursor, System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { makeStripeDrawer } from "../sys32/util/draw.js";
import { multiplex, Reactable } from "../sys32/util/events.js";
import { makeFlowLayout } from "../sys32/util/layouts.js";
import { dragResize } from "../sys32/util/selections.js";

export default function paint(sys: System, filepath?: string) {
  const zoom = new Reactable(4);

  const paintView = sys.make(PaintView, {});

  const widthLabel = sys.make(Label, {});
  const heightLabel = sys.make(Label, {});

  const colorLabel = sys.make(Label, {});
  const zoomLabel = sys.make(Label, {});


  widthLabel.setDataSource('text', paintView.getDataSource('width').adapt(n => n.toString()).reactive);
  heightLabel.setDataSource('text', paintView.getDataSource('height').adapt(n => n.toString()).reactive);

  widthLabel.getDataSource('text').watch(() => { widthLabel.parent?.layoutTree() });
  heightLabel.getDataSource('text').watch(() => { heightLabel.parent?.layoutTree() });

  paintView.setDataSource('zoom', zoom);

  zoom.watch(n => zoomLabel.text = n.toString());
  zoom.watch(n => panel.layoutTree(), false);

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
          paintView.resize(w, h);
        }
      })

    }
  });

  const toolRadios = paintView.getDataSource('tool');

  const pencilButton = makeButton(() => { paintView.tool = 'pencil' });
  const eraserButton = makeButton(() => { paintView.tool = 'eraser' });

  const pencilTool = sys.make(View, { w: 4, h: 4, ...pencilButton.all });
  const eraserTool = sys.make(View, { w: 4, h: 4, ...eraserButton.all });

  pencilTool.setDataSource('background', toolRadios.adapt<number>(t => t === 'pencil' ? 0xffffffff : 0x333333ff).reactive);
  eraserTool.setDataSource('background', toolRadios.adapt<number>(t => t === 'eraser' ? 0xffffffff : 0x333333ff).reactive);

  const colorField = sys.make(TextField, { length: 9, background: 0x111111ff });
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
    toolArea.parent?.layoutTree();
  };

  const currentColor = paintView.getDataSource('color');

  function makeColorButton(color: number) {
    const button = makeButton(() => { paintView.color = color; });
    const selected = currentColor.adapt(n => paintView.color === color).reactive;
    const colorView = sys.make(View, { passthrough: true, w: 4, h: 4, background: color, });
    const border = sys.make(Border, { all: 1, ...button.all }, colorView);

    border.setDataSource('borderColor', multiplex({
      selected: selected,
      hovered: button.hovered,
      pressed: button.pressed,
    }).adapt<number>(data => {
      if (data.selected) return 0xffffff77;
      if (data.pressed) return 0xffffff11;
      if (data.hovered) return 0xffffff33;
      return 0;
    }).reactive);

    toolArea.addChild(border);
  }

  for (const color of COLORS) {
    makeColorButton(color);
  }

  paintView.color = COLORS[3];

  colorLabel.setDataSource('text',
    currentColor.adapt(color => '0x' + color.toString(16).padStart(8, '0'))
      .reactive)

  function digInto<T>(t: T, fn: (t: T) => void) {
    fn(t);
    return t;
  }

  const statusBar = sys.make(SpacedX, {},
    sys.make(GroupX, {},
      sys.make(Label, { color: 0xffffff33, text: 'w:' }), widthLabel,
      sys.make(Label, { color: 0xffffff33, text: ' h:' }), heightLabel,
      sys.make(Label, { color: 0xffffff33, text: ' c:' }), colorLabel,
      sys.make(Label, { color: 0xffffff33, text: ' z:' }), zoomLabel,
    ),
    sys.make(GroupX, {},
      digInto(sys.make(Slider, { knobSize: 3, w: 20 }), slider => {
        slider.setDataSource('val', zoom);
      })
    )
  );

  const paintArea = sys.make(Scroll, {
    background: 0x222222ff,
    draw: makeStripeDrawer(sys),
  },
    paintView,
    resizer
  );

  const panel = sys.make(Panel, { title: 'paint', minw: 50, w: 180, h: 70, },
    sys.make(PanedXB, { gap: 1 },
      sys.make(PanedYB, { gap: 1 },
        paintArea,
        statusBar
      ),
      toolArea,
    ),
  );


  if (filepath) {

    sys.fs.loadFile(filepath!).then(s => {
      if (s) {
        paintView.loadBitmap(s);
      }
    });

  }
  else {
    filepath = 'b/test1.bitmap';
  }




  panel.onKeyDown = (key) => {
    if (key === 'o' && sys.keys['Control']) {


      // sys.fs.loadFile(filepath!).then(s => {
      //   if (s) {
      //     paintView.loadBitmap(s);
      //   }
      // });


    }
    else if (key === 's' && sys.keys['Control']) {
      console.log('saving');

      const bitmap = paintView.toBitmap();

      sys.fs.saveFile(filepath, bitmap.toString()).then(() => {
        console.log('done')
      })

      return true;
    }
    return false;
  };

  sys.root.addChild(panel);
  panel.focus();
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
    super.draw();

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

  loadBitmap(s: string) {
    const b = Bitmap.fromString(s);
    this.resize(b.width, b.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        const ci = b.pixels[i];
        if (ci > 0) {
          const c = b.colors[ci - 1];
          this.#grid[i] = c;
        }
      }
    }
  }

  toBitmap() {
    const colors: number[] = [];
    const pixels: number[] = [];
    const map = new Map<number, number>();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = this.#grid[y * this.width + x];
        if (c === undefined) {
          pixels.push(0);
        }
        else {
          let index = map.get(c);
          if (!index) map.set(c, index = colors.push(c));
          pixels.push(index);
        }
      }
    }
    return new Bitmap(colors, this.width, pixels);
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

    this.parent?.layoutTree();
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

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];
