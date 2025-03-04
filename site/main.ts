import { crt } from "./os/core/crt.js";
import { sys } from "./os/core/system.js";
import { ws } from "./os/desktop/workspace.js";

const canvas = document.createElement('canvas');
canvas.width = 320;
canvas.height = 180;
document.body.replaceChildren(canvas);

// await new Promise(r => setTimeout(r, 1000))

sys.init(canvas);
crt.autoscale();

await ws.addProgram('filer', import.meta.resolve('./apps/filer/'));
await ws.addProgram('demo', import.meta.resolve('./apps/demo/'));
await ws.addProgram('mapmaker', import.meta.resolve('./apps/mapmaker/'));
await ws.addProgram('painter', import.meta.resolve('./apps/painter/'));
await ws.addProgram('writer', import.meta.resolve('./apps/writer/'));
await ws.addProgram('fontmaker', import.meta.resolve('./apps/fontmaker/'));

ws.launch('filer')
