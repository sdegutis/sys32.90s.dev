export { };

const div = document.createElement('div');
div.innerHTML = `<b>loading...</b>`
div.style.color = 'white'
div.style.position = 'absolute'
div.style.x = '0'
div.style.y = '0'
document.body.appendChild(div)

const crt = (await import("./os/core/crt.js")).crt;
const sys = (await import("./os/core/system.js")).sys;
const ws = (await import("./os/desktop/workspace.js")).ws;

// await new Promise(resolve => setTimeout(resolve, 100));

sys.init(document.querySelector('canvas')!);
crt.autoscale();

await ws.addProgram('filer', import.meta.resolve('./apps/filer/'));
// await new Promise(resolve => setTimeout(resolve, 100));
await ws.addProgram('demo', import.meta.resolve('./apps/demo/'));
// await new Promise(resolve => setTimeout(resolve, 100));
await ws.addProgram('mapmaker', import.meta.resolve('./apps/mapmaker/'));
// await new Promise(resolve => setTimeout(resolve, 100));
await ws.addProgram('painter', import.meta.resolve('./apps/painter/'));
// await new Promise(resolve => setTimeout(resolve, 100));
await ws.addProgram('writer', import.meta.resolve('./apps/writer/'));
// await new Promise(resolve => setTimeout(resolve, 100));
await ws.addProgram('fontmaker', import.meta.resolve('./apps/fontmaker/'));
// await new Promise(resolve => setTimeout(resolve, 100));

ws.launch('filer')
// await new Promise(resolve => setTimeout(resolve, 100));

div.remove();
