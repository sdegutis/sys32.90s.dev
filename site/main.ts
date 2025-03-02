import { crt } from "./os/core/crt.js";
import { sys } from "./os/core/system.js";
import { Workspace } from "./os/desktop/workspace.js";

sys.init(document.querySelector('canvas')!);
crt.autoscale();

const ws = new Workspace();
await ws.addProgram('filer', import.meta.resolve('./apps/filer/'));
await ws.addProgram('mapmaker', import.meta.resolve('./apps/mapmaker/'));
await ws.addProgram('painter', import.meta.resolve('./apps/painter/'));
await ws.addProgram('writer', import.meta.resolve('./apps/writer/'));
await ws.addProgram('fontmaker', import.meta.resolve('./apps/fontmaker/'));

ws.launch('filer')
