import { Border } from "../../os/containers/border.js";
import { GroupX, GroupY } from "../../os/containers/group.js";
import { PanedYB } from "../../os/containers/paned.js";
import { Scroll } from "../../os/containers/scroll.js";
import { Label } from "../../os/controls/label.js";
import { Slider } from "../../os/controls/slider.js";
import { Bitmap } from "../../os/core/bitmap.js";
import { crt } from "../../os/core/crt.js";
import { CHARSET, Font } from "../../os/core/font.js";
import { mem } from "../../os/core/memory.js";
import { Panel } from "../../os/core/panel.js";
import { sys } from "../../os/core/system.js";
import { $, View } from "../../os/core/view.js";
import { fs } from "../../os/fs/fs.js";
import { multiplex, Reactive } from "../../os/util/events.js";

const SAMPLE_TEXT = [
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
].join('\n');

export default async (filename?: string) => {

  const $myfont = new Reactive(mem.font);
  const $width = new Reactive($myfont.data.width);
  const $height = new Reactive($myfont.data.height);

  function rebuildWhole() {
    const w = $width.data;
    const h = $height.data;
    const src = new Bitmap([0x000000ff], 16 * w, Array(96 * w * h).fill(0));

    for (const [i, ch] of CHARSET.entries()) {
      const x = i % 16;
      const y = Math.floor(i / 16);
      $myfont.data.chars[ch].draw(x * w, y * h, 1, src);
    }

    $myfont.update(new Font((src.toString())));
  }

  rebuildWhole();

  const $zoom = new Reactive(3);
  const $hovered = new Reactive('');

  if (filename) {
    $myfont.update(new Font(fs.get(filename)!));
    $width.update($myfont.data.width);
    $height.update($myfont.data.height);
  }

  const charViews = new Map<string, CharView>();

  for (const char of CHARSET) {
    const view = $(CharView, { char, $data: { font: $myfont, width: $width, height: $height, zoom: $zoom } });
    charViews.set(char, view);
    view.$data.hovered.watch((h) => { if (h) $hovered.update(char); });
  }

  const panel = $(Panel, { title: 'fontmaker', },
    $(PanedYB, {},
      $(Scroll, {},
        $(View, {
          background: 0x44444499,
          adjust(this: View) {
            const padding = 1 * $zoom.data;
            const gap = 1 * $zoom.data;
            const child = this.firstChild!;
            this.w = padding * 2 + (child.w * 16) + (gap * 15);
            this.h = padding * 2 + (child.h * 6) + (gap * 5);
          },
          layout(this: View) {
            const padding = 1 * $zoom.data;
            const gap = 1 * $zoom.data;

            let i = 0;
            for (let y = 0; y < 6; y++) {
              for (let x = 0; x < 16; x++) {
                const child = this.children[i++];
                if (!child) break;

                child.x = padding + (x * child.w) + (x * gap);
                child.y = padding + (y * child.h) + (y * gap);
              }
            }
          },
        },
          ...charViews.values()
        )
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
    rebuildWhole();
  });

  multiplex({ w: $width, h: $height, z: $zoom, o: $hovered }).watch(() => {
    panel.layoutTree();
  });

  panel.onKeyDown = (key) => {
    if (key === 's' && sys.keys['Control']) {

      if (filename) {
        fs.put(filename, $myfont.data.charsheet.toString())
      }

      return true;
    }
    return false;
  }

  panel.show();

};

class CharView extends View {

  char!: string;
  font!: Font;

  override cursor = null;

  width = 2;
  height = 2;
  zoom = 1;

  spots: Record<string, boolean> = {};

  override background = 0x000000ff;

  override init(): void {
    for (let y = 0; y < this.font.height; y++) {
      for (let x = 0; x < this.font.width; x++) {
        let k = `${x},${y}`;
        if (this.font.chars[this.char].pget(x, y) > 0) {
          this.spots[k] = true;
        }
      }
    }
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

      crt.rectFill(tx, ty, this.zoom, this.zoom, 0xff000099);
    }
  }

  override onMouseDown(button: number): void {
    sys.trackMouse({
      move: () => {
        const tx = Math.floor(this.mouse.x / this.zoom);
        const ty = Math.floor(this.mouse.y / this.zoom);

        const key = `${tx},${ty}`;
        this.spots[key] = button === 0;
        this.font.chars[this.char].pset(tx, ty, button === 0 ? 1 : 0);
      }
    });
  }

}
