import demo from "./apps/demo.js";
import mapmaker from "./apps/mapmaker.js";
import { PanelView } from "./sys32/containers/panelview.js";
import { Split } from "./sys32/containers/split.js";
import { Panel } from "./sys32/core/panel.js";
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
sys.root.view.content.background = 0x330000ff;

const sub = new Panel(sys, {
  title: 'sub',
  x: 30, y: 10, w: 400, h: 300,
  background: 0x003300ff
});

sys.root.view.content.children = [sub.view];

// sys.root.view.children = [sub.view];

// sub.view = sub.make(View, { layout: makeVacuumLayout(20), background: 0x003300ff })
// sys.root.view.children = [sub.view];

// sub.view.children.push(
//   sub.make(View, { layout: makeVacuumLayout(0), background: 0x000033ff },
//     sub.make(Split, { pos: 30, dir: 'x', resizable: true },
//       sub.make(View, { layout: centerLayout, background: 0x003333ff }, demo(sub)),
//       mapmaker(sub),
//     )
//   )
// );




// const win1 = sub.make(PanelView, {
//   title: 'win1', background: 0x003300ff,
//   x: 30, y: 30, w: 40, h: 50,
//   layout: makeVacuumLayout(3)
// },
//   sub.make(View, { background: 0x000099ff })
// );


// sub.view.children = [win1];


sys.layoutTree();

// const ws = new Workspace(sys);

// const win = new Panel(ws, 'mapmaker', mapmaker(sys));
// win.window.x = 100;
// win.window.y = 100;
// win.show();

// const win2 = new Panel(ws, 'demo',
//   b(View, { layout: makeVacuumLayout(0) },
//     b(View, { layout: centerLayout },
//       demo(sys)
//     )
//   )
// );
// win2.window.x = 300;
// win2.window.y = 150;
// win2.show();
