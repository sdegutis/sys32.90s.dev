import demo from "./apps/demo.js";
import mapmaker from "./apps/mapmaker.js";
import paint from "./apps/paint.js";
import { Scroll } from "./sys32/containers/scroll.js";
import { Label } from "./sys32/controls/label.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Panel } from "./sys32/desktop/panel.js";
import { Workspace } from "./sys32/desktop/workspace.js";
import { makeVacuumLayout } from "./sys32/util/layouts.js";

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


let text = '';
for (let i = 0; i < 23; i++) {
  text += String.fromCharCode(97 + i).repeat(i + 1) + '\n';
}


const panel = sys.make(Panel, {
  title: 'both',
  x: 40, y: 40, w: 70, h: 50,
  content: sys.make(View, { layout: makeVacuumLayout(), background: 0x44444433 },
    sys.make(Scroll, { amount: 6, background: 0x0000ff11 },
      sys.make(Label, { text, background: 0x00ff0011 })
    )
  )
});
sys.root.addChild(panel);
sys.layoutTree(panel)

sys.layoutTree()
