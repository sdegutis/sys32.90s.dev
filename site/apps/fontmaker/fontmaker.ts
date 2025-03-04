import { Border } from "../../os/containers/border.js";
import { GroupX, GroupY } from "../../os/containers/group.js";
import { PanedYB } from "../../os/containers/paned.js";
import { Label } from "../../os/controls/label.js";
import { Slider } from "../../os/controls/slider.js";
import { Bitmap } from "../../os/core/bitmap.js";
import { crt } from "../../os/core/crt.js";
import { emptyCursor } from "../../os/core/cursor.js";
import { CHARSET, Font } from "../../os/core/font.js";
import { fs } from "../../os/fs/fs.js";
import { mem, sys } from "../../os/core/system.js";
import { $, View } from "../../os/core/view.js";
import { Panel } from "../../os/core/panel.js";
import { Listener, multiplex, Reactive } from "../../os/util/events.js";

const SAMPLE_TEXT = [
  'the quick brown fox',
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  `abcdefghijklmnopqrstuvwxyz`,
  ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
].join('\n');

export default async (filename?: string) => {

  const $myfont = new Reactive(mem.font);

  const $width = new Reactive(4);
  const $height = new Reactive(5);
  const $zoom = new Reactive(1);
  const $hovered = new Reactive('');

  const rebuilt = new Listener<CharView>();

  const charViews = new Map<string, CharView>();
  let chars: Record<string, Bitmap> = {};

  if (filename) {
    const s = fs.loadFile(filename)!;

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
    const view = $(CharView, { char, rebuilt, initial: chars[char], $data: { width: $width, height: $height, zoom: $zoom } });
    charViews.set(char, view);
    view.$data.hovered.watch((h) => { if (h) $hovered.val = char; });
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
        }, background: 0x44444499
      },
        ...charViews.values()
      ),
      $(Border, { background: 0x000000ff, u: 2 },
        $(GroupY, { gap: 3, align: 'a' },
          $(Label, { text: SAMPLE_TEXT, color: 0x999900ff, $data: { font: $myfont } }),
          $(GroupX, { gap: 10, },
            $(GroupX, { gap: 2 },
              $(Label, { text: 'width:', color: 0xffffff33 }),
              $(Label, { id: 'width-label' }),
              $(Slider, { min: 1, max: 12, w: 20, knobSize: 3, $data: { val: $width } }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'height:', color: 0xffffff33 }),
              $(Label, { id: 'height-label' }),
              $(Slider, { min: 1, max: 12, w: 20, knobSize: 3, $data: { val: $height } }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'zoom:', color: 0xffffff33 }),
              $(Label, { id: 'zoom-label' }),
              $(Slider, { min: 1, max: 5, w: 20, knobSize: 3, $data: { val: $zoom } }),
            ),
            $(GroupX, { gap: 2 },
              $(Label, { text: 'hover:', color: 0xffffff33 }),
              $(Label, { $data: { text: $hovered } }),
            ),
          )
        )
      )
    )
  );

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

    $myfont.val = new Font(chars);
  }

  rebuilt.watch((view) => { rebuildWhole(); })
  rebuildWhole();

  panel.onKeyDown = (key) => {
    if (key === 's' && sys.keys['Control']) {

      filename = `user/foo/bar/qux.font`

      if (filename) {

        // for (let i = 0; i < 26; i++) {
        //   const upcase = String.fromCharCode(65 + i);
        //   chars[upcase] = chars[upcase.toLowerCase()];
        // }

        const orderedChars = Object.keys(chars).sort();

        // const a = chars['a'];
        // const b = new Bitmap(a.colors, a.width * 16, ));

        console.log(chars);
        const saveData = orderedChars.map(ch => chars[ch].toString()).join('===\n');
        fs.saveFile(filename, saveData);
      }

      return true;
    }
    return false;
  }

  panel.show();

};

class CharView extends View {

  initial: Bitmap | undefined;
  char!: string;
  rebuilt!: Listener<CharView>;

  override cursor = emptyCursor;

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

  override onMouseDown(button: number): void {
    sys.trackMouse({
      move: () => {
        const tx = Math.floor(this.mouse.x / this.zoom);
        const ty = Math.floor(this.mouse.y / this.zoom);

        const key = `${tx},${ty}`;
        this.spots[key] = button === 0;
        this.rebuidBitmap();
        this.rebuilt.dispatch(this);
      }
    });
  }

}
