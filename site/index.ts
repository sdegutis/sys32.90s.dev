import demo from "./apps/demo.js";
import filebrowser from "./apps/filebrowser.js";
import files from "./apps/filebrowser.js";
import mapmaker from "./apps/mapmaker.js";
import paint from "./apps/paint.js";
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
filebrowser(sys)
// demo(sys)
// paint(sys);
// texttest(sys);
sys.layoutTree()

const ws = new Workspace(sys);
ws.addProgram('demo', demo);
ws.addProgram('files', files);
ws.addProgram('mapmaker', mapmaker);
ws.addProgram('paint', paint);
ws.addProgram('text test', texttest);


function texttest(sys: System) {
  const textarea = sys.make(TextArea, { background: 0x00990033 });

  textarea.text = 'foo\nbar\n\nhello world'

  textarea.colors[10] = 0x0000ffff;
  textarea.colors[5] = 0xffff0099;
  // textarea.colors.length = 0


  const panel = sys.make(Panel, { title: 'text test', w: 170, h: 150, },
    sys.make(View, { layout: makeVacuumLayout(), background: 0x44444433 },
      sys.make(Scroll, { background: 0x0000ff11 },
        textarea
      )
    )
  );
  sys.root.addChild(panel);
  panel.layoutTree();
  panel.focus();
}
