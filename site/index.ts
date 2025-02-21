import { demo } from "./demo.js";
import mapmaker from "./mapmaker.js";
import { centerLayout, makeVacuumLayout } from "./sys32/containers/layouts.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Panel } from "./sys32/os/panel.js";
import { Workspace } from "./sys32/os/workspace.js";
import { makeBuilder } from "./sys32/util/build.js";

const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();
sys.root.layout = makeVacuumLayout();
const b = makeBuilder(sys);


const ws = new Workspace(sys);

const win = new Panel(ws, 'mapmaker', mapmaker(sys));
win.show();

const win2 = new Panel(ws, 'demo',
  b(View, { layout: makeVacuumLayout(0) },
    b(View, { layout: centerLayout },
      demo(sys)
    )
  )
);
win2.show();
