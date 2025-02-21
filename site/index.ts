import demo from "./apps/demo.js";
import mapmaker from "./apps/mapmaker.js";
import { Panel } from "./sys32/containers/panel.js";
import { Split } from "./sys32/containers/split.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { centerLayout, makeVacuumLayout } from "./sys32/util/layouts.js";





// let i = 0;

// export class Workspace {

//   sys: System;
//   desktop;
//   taskbar;

//   constructor(panel: Panel) {
//     this.sys = sys;

//     const b = makeBuilder(panel);
//     this.desktop = b(View, { background: 0x333333ff });
//     this.taskbar = b(Spaced, { background: 0x000000ff },
//       b(Group, { background: 0x222222ff },
//         b(Button, {
//           padding: 2, onClick() {
//             // i++
//             i = (i + 1) % 2;
//             sys.resize(320 * (i + 1), 180 * (i + 1));
//           }
//         }, b(Label, { text: 'one' }))
//       ),
//       b(Group, { background: 0x222222ff },
//       )
//     );

//     sys.root.children = [
//       b(Paned, { vacuum: 'b', dir: 'y' },
//         this.desktop,
//         this.taskbar,
//       )
//     ];

//     sys.layoutTree();
//   }

// }










const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();
// sys.root.view.layout = makeVacuumLayout(10);
sys.root.background = 0x330000ff;


const $ = sys.make.bind(sys);


sys.root.children.push($(Panel, {
  title: 'demo',
  x: 70, y: 90, w: 400, h: 300,
  content: $(View, { layout: centerLayout, background: 0x22222299 },
    demo(sys)
  )
}));


sys.root.children.push($(Panel, {
  title: 'mapmaker',
  x: 30, y: 10, w: 400, h: 300,
  content: mapmaker(sys)
}));


sys.root.children.push($(Panel, {
  title: 'both',
  x: 90, y: 110, w: 400, h: 300,
  content: $(View, { layout: makeVacuumLayout(), background: 0x000033ff },
    $(Split, { pos: 200, dir: 'x', resizable: true },
      $(View, { layout: centerLayout, background: 0x003333ff },
        demo(sys)
      ),
      mapmaker(sys)
    )
  )
}));


sys.layoutTree();
