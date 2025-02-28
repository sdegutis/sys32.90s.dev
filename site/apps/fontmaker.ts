import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedYB } from "../sys32/containers/paned.js";
import { Label } from "../sys32/controls/label.js";
import { Slider } from "../sys32/controls/slider.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { crt } from "../sys32/core/crt.js";
import { Font } from "../sys32/core/font.js";
import { fs } from "../sys32/core/fs.js";
import { $, sys, type Cursor } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { Listener, multiplex, Reactive } from "../sys32/util/events.js";

const CHARSET = `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`;

const SAMPLE_TEXT = [
  'the quick brown fox',
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  `abcdefghijklmnopqrstuvwxyz`,
  ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
].join('\n');

export default async (filename?: string) => {

  const $width = new Reactive(4);
  const $height = new Reactive(5);
  const $zoom = new Reactive(1);
  const $hovered = new Reactive('');

  const rebuilt = new Listener<CharView>();

  const charViews = new Map<string, CharView>();
  let chars: Record<string, Bitmap> = {};

  if (filename) {
    const s = (await fs.loadFile(filename))!;

    const keys = [...CHARSET].sort();
    const vals = s.split('===\n').map(s => Bitmap.fromString(s));
    keys.forEach((k, i) => { chars[k] = vals[i] });
    $width.val = vals[0].width;
    $height.val = vals[0].height;

    // $width.val = sys.font.width;
    // $height.val = sys.font.height;
    // chars = sys.font.chars;
  }

  for (const char of [...CHARSET]) {
    const view = $(CharView, { char, rebuilt, initial: chars[char] });
    view.setDataSource('width', $width);
    view.setDataSource('height', $height);
    view.setDataSource('zoom', $zoom);
    charViews.set(char, view);
    view.watch('hovered', (h) => { if (h) $hovered.val = char; });
  }

  const panel = $(Panel, { title: 'fontmaker', },
    $(PanedYB, {},
      $(View, {
        layout: function (this: View) {
          const padding = 1 * $zoom.val;
          const gap = 1 * $zoom.val;

          let x = padding;
          let y = padding;
          let h = 0;
          for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];

            if (x + child.w > this.w && i > 0) {
              x = padding;
              y += h + gap;
              h = 0;
            }

            child.x = x;
            child.y = y;
            x += child.w + gap;
            if (child.h > h) h = child.h;
          }
        }, background: 0x44444433
      },
        ...charViews.values()
      ),
      $(Border, { background: 0x000000ff, u: 2 },
        $(GroupY, { gap: 3, align: 'a' },
          $(Label, { id: 'sample', text: SAMPLE_TEXT, color: 0x999900ff }),
          $(GroupX, { gap: 10, },
            $(GroupX, { gap: 2 },
              $(Label, { text: 'width:', color: 0xffffff33 }),
              $(Label, { id: 'width-label' }),
              $(Slider, { id: 'width-slider', min: 1, max: 12, w: 20, knobSize: 3 }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'height:', color: 0xffffff33 }),
              $(Label, { id: 'height-label' }),
              $(Slider, { id: 'height-slider', min: 1, max: 12, w: 20, knobSize: 3 }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'zoom:', color: 0xffffff33 }),
              $(Label, { id: 'zoom-label' }),
              $(Slider, { id: 'zoom-slider', min: 1, max: 5, w: 20, knobSize: 3 }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'hover:', color: 0xffffff33 }),
              $(Label, { id: 'hover-label' }),
            ),
          )
        )
      )
    )
  );

  panel.find<Slider>('width-slider')!.setDataSource('val', $width);
  panel.find<Slider>('height-slider')!.setDataSource('val', $height);
  panel.find<Slider>('zoom-slider')!.setDataSource('val', $zoom);
  panel.find<Label>('hover-label')!.setDataSource('text', $hovered);

  $width.watch((n) => { panel.find<Label>('width-label')!.text = n.toString(); });
  $height.watch((n) => { panel.find<Label>('height-label')!.text = n.toString(); });
  $zoom.watch((n) => { panel.find<Label>('zoom-label')!.text = n.toString(); });

  multiplex({ w: $width, h: $height }).watch(() => {
    for (const v of charViews.values()) {
      v.rebuidBitmap();
    }
    rebuildWhole();
  });

  multiplex({ w: $width, h: $height, z: $zoom, o: $hovered }).watch(() => {
    panel.layoutTree();
  });

  function rebuildWhole() {
    for (const v of charViews.values()) {
      chars[v.char] = v.bitmap;
    }

    let myfont = new Font(chars);
    panel.find<Label>('sample')!.font = myfont;
  }

  rebuilt.watch((view) => { rebuildWhole(); })
  rebuildWhole();

  panel.onKeyDown = (key) => {
    if (key === 's' && sys.keys['Control']) {
      const orderedChars = Object.keys(chars).sort();
      const saveData = orderedChars.map(ch => chars[ch].toString()).join('===\n');
      fs.saveFile('e/font1.font', saveData);
      return true;
    }
    return false;
  }

  sys.root.addChild(panel);

};

class CharView extends View {

  initial: Bitmap | undefined;
  char!: string;
  rebuilt!: Listener<CharView>;

  override cursor: Cursor = { bitmap: new Bitmap([], 0, []), offset: [0, 0] };

  width = 2;
  height = 2;
  zoom = 1;

  bitmap!: Bitmap;

  spots: Record<string, boolean> = {};

  override background = 0x000000ff;

  override init(): void {
    if (this.initial) {
      for (let y = 0; y < this.initial.height; y++) {
        for (let x = 0; x < this.initial.width; x++) {
          let k = `${x},${y}`;
          if (this.initial.pixels[y * this.initial.width + x] > 0) {
            this.spots[k] = true;
          }
        }
      }
    }
  }

  rebuidBitmap() {
    const pixels: number[] = [];

    let i = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`;
        pixels.push(this.spots[key] ? 1 : 0);
      }
    }

    this.bitmap = new Bitmap([0x000000ff], this.width, pixels);
  }

  override adjust(): void {
    this.w = this.width * this.zoom;
    this.h = this.height * this.zoom;
  }

  override draw(): void {
    super.draw();

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tx = x * this.zoom;
        const ty = y * this.zoom;
        const key = `${x},${y}`;

        if (this.spots[key]) {
          crt.rectFill(tx, ty, this.zoom, this.zoom, 0xffffffff);
        }
      }
    }

    if (this.hovered) {
      const tx = Math.floor(this.mouse.x / this.zoom) * this.zoom;
      const ty = Math.floor(this.mouse.y / this.zoom) * this.zoom;

      crt.rectFill(tx, ty, this.zoom, this.zoom, 0x0000ff99);
    }
  }

  override onMouseDown(): void {
    sys.trackMouse({
      move: () => {
        const tx = Math.floor(this.mouse.x / this.zoom);
        const ty = Math.floor(this.mouse.y / this.zoom);

        const key = `${tx},${ty}`;
        this.spots[key] = sys.mouse.button === 0;
        this.rebuidBitmap();
        this.rebuilt.dispatch(this);
      }
    });
  }

}
