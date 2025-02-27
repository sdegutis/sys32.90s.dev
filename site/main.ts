import demo from "./apps/demo.js";
import filer from "./apps/filer.js";
import mapmaker from "./apps/mapmaker.js";
import painter from "./apps/painter.js";
import writer from "./apps/writer.js";
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

writer(sys);
// mapmaker(sys);
// filer(sys)
// demo(sys)
// painter(sys);
// texttest(sys);
sys.layoutTree()

const ws = new Workspace(sys);
ws.addProgram('demo', demo);
ws.addProgram('filer', filer);
ws.addProgram('mapmaker', mapmaker);
ws.addProgram('painter', painter);
ws.addProgram('writer', writer);
