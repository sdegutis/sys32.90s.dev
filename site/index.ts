import demo from "./apps/demo.js";
import mapmaker from "./apps/mapmaker.js";
import paint from "./apps/paint.js";
import { System } from "./sys32/core/system.js";
import { Workspace } from "./sys32/desktop/workspace.js";

const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();

const ws = new Workspace(sys);

ws.addProgram('demo', demo);
ws.addProgram('mapmaker', mapmaker);
ws.addProgram('paint', paint);

paint(ws);

sys.layoutTree()

// const panel = ws.newPanel({
//   title: 'mapmaker',
//   content: mapmaker(sys),
// });


// let text = '';
// for (let i = 0; i < 23; i++) {
//   text += String.fromCharCode(97 + i).repeat(i + 1) + '\n';
// }


// const panel = sys.make(Panel, {
//   title: 'both',
//   x: 40, y: 40, w: 70, h: 50,
//   content: sys.make(View, { layout: makeVacuumLayout(), background: 0x44444433 },
//     sys.make(Scroll, { amount: 6, background: 0x0000ff11 },
//       sys.make(Label, { text, background: 0x00ff0011 })
//     )
//   )
// });
// sys.root.addChild(panel);
