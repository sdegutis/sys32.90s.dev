import { Border } from "../sys32/containers/border.js";
import { GroupX } from "../sys32/containers/group.js";
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

  const letters = `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^\\`.split('');

  const $width = new Reactive(4);
  const $height = new Reactive(5);
  const $zoom = new Reactive(1);

  const panel = $(Panel, { title: 'fontmaker', },
    $(PanedYB, {},
      $(View, { layout: makeFlowLayout(1, 1), background: 0x44444433 },
        ...letters.map(ch => {
          const view = $(CharView, { background: 0x99000099 });
          view.setDataSource('width', $width);
          view.setDataSource('height', $height);
          view.setDataSource('zoom', $zoom);
          return view;
        })
      ),
      $(Border, { background: 0x000000ff, u: 2 },
        $(GroupX, { gap: 10, },
          $(GroupX, { gap: 2 },
            $(Label, { text: 'width:' }),
            $(Label, { id: 'widthlabel' }),
            $(Slider, { id: 'width', min: 1, max: 12, val: 4, w: 20 }),
          ),
          $(GroupX, { gap: 2 },
            $(Label, { text: 'height:' }),
            $(Label, { id: 'heightlabel' }),
            $(Slider, { id: 'height', min: 1, max: 12, val: 4, w: 20 }),
          ),
          $(GroupX, { gap: 2 },
            $(Label, { text: 'zoom:' }),
            $(Label, { id: 'zoomlabel' }),
            $(Slider, { id: 'zoom', min: 1, max: 12, val: 4, w: 20 }),
          ),
        )
      )
    )
  );

  panel.find<Slider>('width')!.setDataSource('val', $width);
  panel.find<Slider>('height')!.setDataSource('val', $height);
  panel.find<Slider>('zoom')!.setDataSource('val', $zoom);

  $width.watch(() => panel.layoutTree())
  $height.watch(() => panel.layoutTree())
  $zoom.watch(() => panel.layoutTree())

  $width.watch((n) => { panel.find<Label>('widthlabel')!.text = n.toString(); panel.layoutTree() })
  $height.watch((n) => { panel.find<Label>('heightlabel')!.text = n.toString(); panel.layoutTree() })
  $zoom.watch((n) => { panel.find<Label>('zoomlabel')!.text = n.toString(); panel.layoutTree() })

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
