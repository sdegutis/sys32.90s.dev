import demo from "./apps/demo.js";
import filer from "./apps/filer.js";
import mapmaker from "./apps/mapmaker.js";
import painter from "./apps/painter.js";
import { Scroll } from "./sys32/containers/scroll.js";
import { TextArea } from "./sys32/containers/textarea.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Panel } from "./sys32/desktop/panel.js";
import { Workspace } from "./sys32/desktop/workspace.js";
import { makeVacuumLayout } from "./sys32/util/layouts.js";


const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();
// sys.root.background = 0x003300ff;
// sys.root.layout = makeVacuumLayout()

// mapmaker(sys);
// filer(sys)
// demo(sys)
painter(sys);
// texttest(sys);
sys.layoutTree()

const ws = new Workspace(sys);
ws.addProgram('demo', demo);
ws.addProgram('filer', filer);
ws.addProgram('mapmaker', mapmaker);
ws.addProgram('painter', painter);
ws.addProgram('writer', writer);


const { $ } = sys;

function writer(sys: System) {
  const textarea = $(TextArea, { background: 0x00990033 });

  textarea.text = 'foo\nbar\n\nhello world'

  textarea.colors[10] = 0x0000ffff;
  textarea.colors[5] = 0xffff0099;
  // textarea.colors.length = 0


  const panel = $(Panel, { title: 'text test', w: 170, h: 150, },
    $(View, { layout: makeVacuumLayout(), background: 0x44444433 },
      $(Scroll, { background: 0x0000ff11 },
        textarea
      )
    )
  );
  sys.root.addChild(panel);
  panel.layoutTree();
  panel.focus();
}
