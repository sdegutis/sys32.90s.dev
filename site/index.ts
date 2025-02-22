import { demo } from "./apps/demo.js";
import { mapmaker } from "./apps/mapmaker.js";
import { Group } from "./sys32/containers/group.js";
import { Split } from "./sys32/containers/split.js";
import { Label } from "./sys32/controls/label.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Workspace } from "./sys32/desktop/workspace.js";
import { centerLayout, makeVacuumLayout } from "./sys32/util/layouts.js";

const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();

const ws = new Workspace(sys);

const appPaths = await fetch('./apps.json').then<string[]>(res => res.json());
appPaths.forEach(p => {
  import(p).then(mod => {
    const start = mod.default;
    ws.addProgram(p.split('/').at(-1)!, start);
  });
})

ws.addProgram('both', (ws) => {
  const $ = sys.make.bind(sys);
  const panel = ws.newPanel({
    title: 'both',
    x: 90, y: 110, w: 400, h: 300,
    content: $(View, { layout: makeVacuumLayout(), background: 0x000033ff },
      $(Split, { pos: 200, min: 20, max: 20, dir: 'x', resizable: true },
        $(View, { layout: centerLayout, background: 0x003333ff },
          demo(sys)
        ),
        mapmaker(sys)
      )
    )
  });
});


class Scroll extends Group {

  sx = 0;
  sy = 0;

  override adjust(): void {
    this.w = this.parent!.w;
    this.h = this.parent!.h;
  }

  override layout(): void {
    this.firstChild!.x = -this.sx;
    this.firstChild!.y = -this.sy;
  }

  override onScroll(up: boolean): void {
    const sy = this.sys.keys['Shift'] ? 'sx' : 'sy';
    const dh = this.sys.keys['Shift'] ? 'w' : 'h';

    const n = 6;
    this[sy] += up ? -n : n;

    const max = this.firstChild![dh] - this[dh];
    if (this[sy] >= max) this[sy] = max;
    if (this[sy] < 0) this[sy] = 0;

    this.sys.layoutTree(this);
  }

}


let text = '';
for (let i = 0; i < 23; i++) {
  text += String.fromCharCode(97 + i).repeat(i + 1) + '\n';
}


const $ = sys.make.bind(sys);
const panel = ws.newPanel({
  title: 'both',
  x: 20, y: 30, w: 240, h: 130,
  content: $(View, { layout: makeVacuumLayout(), background: 0x44444433 },
    $(Scroll, { background: 0x0000ff11 },
      $(Label, { text, background: 0x00ff0033 })
    )
  )
});
