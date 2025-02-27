import demo from "./apps/demo.js";
import filer from "./apps/filer.js";
import mapmaker from "./apps/mapmaker.js";
import painter from "./apps/painter.js";
import writer from "./apps/writer.js";
import { System } from "./sys32/core/system.js";
import { Workspace } from "./sys32/desktop/workspace.js";

const sys = new System(document.querySelector('canvas')!);
sys.crt.autoscale();

writer(sys);
// mapmaker(sys);
// filer(sys)
// demo(sys)
// painter(sys);
// texttest(sys);
// sys.layoutTree()

const ws = new Workspace(sys);
ws.addProgram('demo', demo);
ws.addProgram('filer', filer);
ws.addProgram('mapmaker', mapmaker);
ws.addProgram('painter', painter);
ws.addProgram('writer', writer);
