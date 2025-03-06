import { mem } from "./os/core/memory.js";
import { sys } from "./os/core/system.js";
import { ws } from "./os/desktop/workspace.js";
import { fs } from "./os/fs/fs.js";

await fs.mountUserDrives();

mem.init();
sys.init();
ws.init();

await ws.addProgram('filer', import.meta.resolve('./apps/filer/'));
await ws.addProgram('settings', import.meta.resolve('./apps/settings/'));
await ws.addProgram('demo', import.meta.resolve('./apps/demo/'));
await ws.addProgram('mapmaker', import.meta.resolve('./apps/mapmaker/'));
await ws.addProgram('painter', import.meta.resolve('./apps/painter/'));
await ws.addProgram('writer', import.meta.resolve('./apps/writer/'));
await ws.addProgram('fontmaker', import.meta.resolve('./apps/fontmaker/'));

// ws.launch('writer', 'os/controls/button.ts')
// ws.launch('settings')
