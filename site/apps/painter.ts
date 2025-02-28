import { GroupX } from "../sys32/containers/group.js";
import { PanedXB, PanedYB } from "../sys32/containers/paned.js";
import { Scroll } from "../sys32/containers/scroll.js";
import { SpacedX } from "../sys32/containers/spaced.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { Slider } from "../sys32/controls/slider.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { crt } from "../sys32/core/crt.js";
import { emptyCursor } from "../sys32/core/cursor.js";
import { fs } from "../sys32/core/fs.js";
import { sys } from "../sys32/core/system.js";
import { $, View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { makeStripeDrawer } from "../sys32/util/draw.js";
import { multiplex, Reactive } from "../sys32/util/events.js";
import { makeFlowLayout } from "../sys32/util/layouts.js";
import { dragResize } from "../sys32/util/selections.js";

export default (filepath?: string) => {

  const panel = $(Panel, { title: 'painter', minw: 50, w: 180, h: 70, },
    $(PanedXB, { gap: 1 },
      $(PanedYB, { gap: 1 },
        $(Scroll, { background: 0x222222ff, draw: makeStripeDrawer(), },
          $(PaintView, { id: 'paintView', color: COLORS[3] }),
          $(ResizerView, { id: 'resizer', background: 0x00000077, w: 4, h: 4, })
        ),
        $(SpacedX, {},
          $(GroupX, {},
            $(Label, { color: 0xffffff33, text: 'w:' }), $(Label, { id: 'widthLabel' }),
            $(Label, { color: 0xffffff33, text: ' h:' }), $(Label, { id: 'heightLabel' }),
            $(Label, { color: 0xffffff33, text: ' c:' }), $(Label, { id: 'colorLabel' }),
            $(Label, { color: 0xffffff33, text: ' z:' }), $(Label, { id: 'zoomLabel' }),
          ),
          $(GroupX, { gap: 1 },
            $(Button, { id: 'grid-button', onClick() { paintView.showGrid = !paintView.showGrid } },
              $(Label, { text: 'grid' })
            ),
            $(Slider, { id: 'zoom-slider', knobSize: 3, w: 20, min: 1, max: 12 })
          )
        )
      ),
      $(View, { id: 'toolArea', w: 36, background: 0x99000033, layout: makeFlowLayout(), },
        $(Button, { id: 'pencilTool', onClick: () => { paintView.tool = 'pencil'; } }, $(View, { passthrough: true, w: 4, h: 4 })),
        $(Button, { id: 'eraserTool', onClick: () => { paintView.tool = 'eraser'; } }, $(View, { passthrough: true, w: 4, h: 4 })),
        $(TextField, { id: 'colorField', length: 9, background: 0x111111ff }),
      ),
    ),
  );

  const paintView = panel.find<PaintView>('paintView')!;

  const widthLabel = panel.find<Label>('widthLabel')!;
  const heightLabel = panel.find<Label>('heightLabel')!;
  const colorLabel = panel.find<Label>('colorLabel')!;
  const zoomLabel = panel.find<Label>('zoomLabel')!;

  const toolArea = panel.find<View>('toolArea')!;
  const pencilTool = panel.find<View>('pencilTool')!;
  const eraserTool = panel.find<View>('eraserTool')!;
  const colorField = panel.find<TextField>('colorField')!;

  panel.find<Slider>('zoom-slider')!.setDataSource('val', paintView.getDataSource('zoom'));

  paintView.watch('width', n => widthLabel.text = n.toString());
  paintView.watch('height', n => heightLabel.text = n.toString());

  widthLabel.watch('text', () => { widthLabel.parent?.layoutTree() });
  heightLabel.watch('text', () => { heightLabel.parent?.layoutTree() });

  paintView.watch('zoom', n => zoomLabel.text = n.toString());
  paintView.watch('zoom', n => panel.layoutTree());

  paintView.watch('tool', t => pencilTool.background = t === 'pencil' ? 0xffffffff : 0x333333ff);
  paintView.watch('tool', t => eraserTool.background = t === 'eraser' ? 0xffffffff : 0x333333ff);

  colorField.onEnter = () => {
    const color = parseInt('0x' + colorField.text, 16);
    colorField.text = '';
    makeColorButton(color);
    toolArea.parent?.layoutTree();
  };

  const colorsWithButtons = new Set<number>();

  function makeColorButton(color: number) {
    colorsWithButtons.add(color);

    const colorView = $(View, { passthrough: true, w: 4, h: 4, background: color, });
    const border = $(Button, { all: 1, onClick: () => { paintView.color = color; } }, colorView);

    multiplex({
      currentColor: paintView.getDataSource('color'),
      hovered: border.getDataSource('hovered'),
      pressed: border.getDataSource('pressed'),
    }).watch(data => {
      let c = 0;
      if (data.currentColor === color) c = 0xffffff77;
      else if (data.pressed) c = 0xffffff11;
      else if (data.hovered) c = 0xffffff33;
      border.borderColor = c;
    });

    toolArea.addChild(border);
  }

  for (const color of COLORS) {
    makeColorButton(color);
  }

  paintView.watch('color', color => colorLabel.text = '0x' + color.toString(16).padStart(8, '0'));

  const filesource = new Reactive('');

  setTimeout(() => {
    filesource.val = 'b/foo.bitmap';
  }, 1000);

  filesource.watch(s => {
    panel.title = s.length === 0 ? `painter: [no file]` : `painter: ${s}`;
    panel.layoutTree();
  });


  if (filepath) {

    fs.loadFile(filepath!).then(s => {
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

      fs.saveFile(filepath, bitmap.toString()).then(() => {
        console.log('done')
      })

      return true;
    }
    return false;
  };

  paintView.watch('color', color => {
    if (!colorsWithButtons.has(color)) {
      makeColorButton(color);
      toolArea.parent?.layoutTree();
    }
  });

  sys.root.addChild(panel);
}





class PaintView extends View {

  showGrid = true;

  width = 10;
  height = 10;

  zoom = 4;

  color = 0xffffffff;

  tool: 'pencil' | 'eraser' = 'pencil';

  override background = 0xffffff33;
  override cursor = emptyCursor;

  #grid: number[] = [];

  override adjust(): void {
    this.w = this.width * this.zoom;
    this.h = this.height * this.zoom;
  }

  override draw(): void {
    super.draw();

    if (this.showGrid) {
      for (let x = 0; x < this.width; x++) {
        crt.rectFill(x * this.zoom, 0, 1, this.h, 0x00000033);
      }
      for (let y = 0; y < this.height; y++) {
        crt.rectFill(0, y * this.zoom, this.w, 1, 0x00000033);
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;
        const c = this.#grid[i];
        if (c !== undefined) {
          const px = x * this.zoom;
          const py = y * this.zoom;
          crt.rectFill(px, py, this.zoom, this.zoom, c);
        }
      }
    }

    if (this.hovered) {
      const px = Math.floor(this.mouse.x / this.zoom) * this.zoom;
      const py = Math.floor(this.mouse.y / this.zoom) * this.zoom;
      crt.rectFill(px, py, this.zoom, this.zoom, 0x0000ff77);
    }
  }

  override onMouseDown(): void {
    if (sys.mouse.button !== 0) {
      const x = Math.floor(this.mouse.x / this.zoom);
      const y = Math.floor(this.mouse.y / this.zoom);
      const i = y * this.width + x;
      let colorUnderMouse = this.#grid[i];
      if (colorUnderMouse === undefined) colorUnderMouse = 0x00000000;
      this.color = colorUnderMouse;
      return;
    }

    if (this.tool === 'pencil' || this.tool === 'eraser') {
      sys.trackMouse({
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

}

class ResizerView extends View {

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

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];
