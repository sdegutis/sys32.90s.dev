import demo from "./apps/demo.js";
import mapmaker from "./apps/mapmaker.js";
import { Group } from "./sys32/containers/group.js";
import { Paned } from "./sys32/containers/paned.js";
import { Panel } from "./sys32/containers/panel.js";
import { Spaced } from "./sys32/containers/spaced.js";
import { Split } from "./sys32/containers/split.js";
import { Button } from "./sys32/controls/button.js";
import { Label } from "./sys32/controls/label.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { centerLayout, makeVacuumLayout } from "./sys32/util/layouts.js";


const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();
sys.root.layout = makeVacuumLayout();
sys.root.background = 0x330000ff;


const $ = sys.make.bind(sys);



class ClockView extends Group {

  #label = $(Label);

  override init(): void {
    this.children = [this.#label];
    this.#updateTime();
    setInterval((() => {
      this.#updateTime();
      sys.layoutTree();
    }), 1000);
  }

  #updateTime() {
    this.#label.text = new Date().toLocaleTimeString('en-us');
  }

}


let i = 1;

const desktop = $(View, { background: 0x333333ff });
const taskbar = $(Spaced, { background: 0x000000ff },
  $(Group, { background: 0x222222ff },
    $(Button, {
      padding: 2, onClick() {
        i = (i + 1) % 2;
        sys.resize(320 * (i + 1), 180 * (i + 1));
      }
    }, $(Label, { text: 'one' }))
  ),
  $(Group, { background: 0x222222ff },
    $(ClockView)
  ),
  $(Group, {},
    $(ClockView, { padding: 2 }),
    $(Button, {
      background: 0x222222ff,
      padding: 2, onClick() {
        i = (i + 1) % 2;
        sys.resize(320 * (i + 1), 180 * (i + 1));
      }
    }, $(Label, { text: 'resize' }))
  ),
);

sys.root.children = [
  $(Paned, { vacuum: 'b', dir: 'y' },
    desktop,
    taskbar,
  )
];


// sys.root.addChild($(Panel, {
//   title: 'demo',
//   x: 70, y: 90, w: 400, h: 300,
//   content: $(View, { layout: centerLayout, background: 0x22222299 },
//     demo(sys)
//   )
// }));


// sys.root.addChild($(Panel, {
//   title: 'mapmaker',
//   x: 30, y: 10, w: 400, h: 300,
//   content: mapmaker(sys)
// }));


// sys.root.addChild($(Panel, {
//   title: 'both',
//   x: 90, y: 110, w: 400, h: 300,
//   content: $(View, { layout: makeVacuumLayout(), background: 0x000033ff },
//     $(Split, { pos: 200, dir: 'x', resizable: true },
//       $(View, { layout: centerLayout, background: 0x003333ff },
//         demo(sys)
//       ),
//       mapmaker(sys)
//     )
//   )
// }));


sys.layoutTree();
