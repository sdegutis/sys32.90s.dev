import { demo } from "./apps/demo.js";
import { mapmaker } from "./apps/mapmaker.js";
import { Split } from "./sys32/containers/split.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Workspace } from "./sys32/desktop/workspace.js";
import { centerLayout, makeVacuumLayout } from "./sys32/util/layouts.js";

const appPaths = await fetch('./apps.json').then<string[]>(res => res.json());

const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();

const ws = new Workspace(sys);

appPaths.forEach(p => {
  import(p).then(mod => {
    const start = mod.default;
    start(ws);
    sys.layoutTree();
  });
})


const $ = sys.make.bind(sys);

ws.newPanel({
  title: 'both',
  x: 90, y: 110, w: 400, h: 300,
  content: $(View, { layout: makeVacuumLayout(), background: 0x000033ff },
    $(Split, { pos: 200, dir: 'x', resizable: true },
      $(View, { layout: centerLayout, background: 0x003333ff },
        demo(sys)
      ),
      mapmaker(sys)
    )
  )
});
