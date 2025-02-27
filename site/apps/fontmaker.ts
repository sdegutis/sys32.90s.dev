import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedYB } from "../sys32/containers/paned.js";
import { Label } from "../sys32/controls/label.js";
import { Slider } from "../sys32/controls/slider.js";
import type { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { Reactive } from "../sys32/util/events.js";
import { makeFlowLayout } from "../sys32/util/layouts.js";

export default (sys: System) => {

  const { $ } = sys;

  const charset = `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`;

  const sampleText = [
    'the quick brown fox',
    `abcdefghijklmnopqrstuvwxyz`,
    ` .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`,
  ].join('\n');

  const mapping = Object.fromEntries([...charset].map(ch => {
    return [ch, ch];
  }));

  const $width = new Reactive(4);
  const $height = new Reactive(5);
  const $zoom = new Reactive(1);

  const panel = $(Panel, { title: 'fontmaker', },
    $(PanedYB, {},
      $(View, { layout: makeFlowLayout(1, 1), background: 0x44444433 },
        ...[...charset].map(ch => {
          const view = $(CharView, { background: 0x99000099 });
          view.setDataSource('width', $width);
          view.setDataSource('height', $height);
          view.setDataSource('zoom', $zoom);
          return view;
        })
      ),
      $(Border, { background: 0x000000ff, u: 2 },
        $(GroupY, { gap: 3, align: 'a' },

          $(Label, { text: sampleText, color: 0x999900ff }),

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

  $width.watch(() => panel.layoutTree())
  $height.watch(() => panel.layoutTree())
  $zoom.watch(() => panel.layoutTree())

  $width.watch((n) => { panel.find<Label>('width-label')!.text = n.toString(); panel.layoutTree() })
  $height.watch((n) => { panel.find<Label>('height-label')!.text = n.toString(); panel.layoutTree() })
  $zoom.watch((n) => { panel.find<Label>('zoom-label')!.text = n.toString(); panel.layoutTree() })

  sys.root.addChild(panel);

};

class CharView extends View {

  width = 4;
  height = 5;
  zoom = 1;

  override adjust(): void {
    this.w = this.width * this.zoom;
    this.h = this.height * this.zoom;
  }

}
