import { demo } from "./apps/demo.js";
import { mapmaker } from "./apps/mapmaker.js";
import paint from "./apps/paint.js";
import { Split } from "./sys32/containers/split.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Panel } from "./sys32/desktop/panel.js";
import { Workspace } from "./sys32/desktop/workspace.js";
import { centerLayout, makeVacuumLayout } from "./sys32/util/layouts.js";

const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();

const ws = new Workspace(sys);

const appPaths = await fetch('./apps.json').then<string[]>(res => res.json());
appPaths.forEach(p => {
  import(p).then(mod => {
    const start = mod.default;
    ws.addProgram(p.split('/').at(-1)!, start);
  });
})

ws.addProgram('both', (ws) => {
  const panel = sys.make(Panel, {
    title: 'both',
    content: sys.make(View, { layout: makeVacuumLayout(), background: 0x000033ff },
      sys.make(Split, { pos: 200, min: 20, max: 20, dir: 'x', resizable: true },
        sys.make(View, { layout: centerLayout, background: 0x003333ff },
          demo(sys)
        ),
        mapmaker(sys)
      )
    )
  })
  ws.addPanel(panel);
});

paint(ws);

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
