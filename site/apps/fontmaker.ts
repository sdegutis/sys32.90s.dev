import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedYB } from "../sys32/containers/paned.js";
import { Label } from "../sys32/controls/label.js";
import { Slider } from "../sys32/controls/slider.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import type { Cursor, System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { Listener, multiplex, Reactive } from "../sys32/util/events.js";
import { makeFlowLayout } from "../sys32/util/layouts.js";

const CHARSET = `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`;

const SAMPLE_TEXT = [
  'the quick brown fox',
  `abcdefghijklmnopqrstuvwxyz`,
  ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
].join('\n');

export default (sys: System) => {

  const { $ } = sys;

  const $width = new Reactive(4);
  const $height = new Reactive(5);
  const $zoom = new Reactive(1);

  const rebuilt = new Listener<CharView>();

  const chars = new Map<string, CharView>();
  for (const char of [...CHARSET]) {
    const view = $(CharView, { char, rebuilt });
    view.setDataSource('width', $width);
    view.setDataSource('height', $height);
    view.setDataSource('zoom', $zoom);
    chars.set(char, view);
  }

  const panel = $(Panel, { title: 'fontmaker', },
    $(PanedYB, {},
      $(View, { layout: makeFlowLayout(1, 1), background: 0x44444433 },
        ...chars.values()
      ),
      $(Border, { background: 0x000000ff, u: 2 },
        $(GroupY, { gap: 3, align: 'a' },
          $(Label, { text: SAMPLE_TEXT, color: 0x999900ff }),
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
          )
        )
      )
    )
  );

  panel.find<Slider>('width-slider')!.setDataSource('val', $width);
  panel.find<Slider>('height-slider')!.setDataSource('val', $height);
  panel.find<Slider>('zoom-slider')!.setDataSource('val', $zoom);

  $width.watch((n) => { panel.find<Label>('width-label')!.text = n.toString(); });
  $height.watch((n) => { panel.find<Label>('height-label')!.text = n.toString(); });
  $zoom.watch((n) => { panel.find<Label>('zoom-label')!.text = n.toString(); });

  $width.watch(() => panel.layoutTree());
  $height.watch(() => panel.layoutTree());
  $zoom.watch(() => panel.layoutTree());

  multiplex({ w: $width, h: $height }).watch(() => {
    for (const v of chars.values()) {
      v.rebuidBitmap();
    }
  });

  function rebuildWhole() {
    console.log('rebuild whole font')
  }

  rebuilt.watch((view) => { rebuildWhole(); })
  rebuildWhole();

  sys.root.addChild(panel);

};

class CharView extends View {

  char!: string;
  rebuilt!: Listener<CharView>;

  override cursor: Cursor = { bitmap: new Bitmap([], 0, []), offset: [0, 0] };

  width = 2;
  height = 2;
  zoom = 1;

  spots: Record<string, boolean> = {};

  override background = 0x000000ff;

  rebuidBitmap() {
    console.log('rebuilding', this.width, this.height, this.char)
    this.rebuilt.dispatch(this);
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
          this.sys.crt.rectFill(tx, ty, this.zoom, this.zoom, 0xffffffff);
        }
      }
    }

    if (this.hovered) {
      const tx = Math.floor(this.mouse.x / this.zoom) * this.zoom;
      const ty = Math.floor(this.mouse.y / this.zoom) * this.zoom;

      this.sys.crt.rectFill(tx, ty, this.zoom, this.zoom, 0x0000ff99);
    }
  }

  override onMouseDown(): void {
    const tx = Math.floor(this.mouse.x / this.zoom);
    const ty = Math.floor(this.mouse.y / this.zoom);

    const key = `${tx},${ty}`;
    this.spots[key] = !this.spots[key];
    this.rebuidBitmap();
  }

}
