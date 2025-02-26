import demo from "./apps/demo.js";
import files from "./apps/files.js";
import mapmaker from "./apps/mapmaker.js";
import paint from "./apps/paint.js";
import { Scroll } from "./sys32/containers/scroll.js";
import { TextArea } from "./sys32/containers/textarea.js";
import { Label } from "./sys32/controls/label.js";
import { System } from "./sys32/core/system.js";
import { View } from "./sys32/core/view.js";
import { Panel } from "./sys32/desktop/panel.js";
import { Workspace } from "./sys32/desktop/workspace.js";
import { Listener } from "./sys32/util/events.js";
import { makeVacuumLayout } from "./sys32/util/layouts.js";



class Foo {

  x = 1;
  y = 2;

  #watchers: Record<any, Listener<any, any>> = {};

  watch<K extends keyof this, T = this[K]>(key: K, fn: (data: T) => void) {
    let watcher = this.#watchers[key];
    if (!watcher) this.#watchers[key] = watcher = new Listener<T>();
    return watcher.watch(fn);
  }

  reflect() {
    for (let [key, val] of Object.entries(this)) {
      if (Object.getOwnPropertyDescriptor(this, key)?.get) continue;
      Reflect.defineProperty(this, key, {
        enumerable: true,
        set: (v) => this.#watchers[key]?.dispatch?.(val = v),
        get: () => val,
      });
    }
  }

}

class Bar extends Foo {

  override x = 11;
  z = 3;

}

const foo = new Foo();
foo.reflect();
const done = foo.watch('x', d => { console.log('watched', d) })
foo.x = 234;
foo.x = 235;
done();
foo.x = 236;
console.log(foo.x)

const bar = new Bar();
bar.reflect();
const done2 = bar.watch('y', n => console.log('watched2', n))
bar.y = 123;
bar.x = 111;
bar.y = 124;
bar.y = 125;
done2();
console.log(bar.y)




const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.crt.autoscale();
// sys.root.background = 0x003300ff;
// sys.root.layout = makeVacuumLayout()

// mapmaker(sys);
// files(sys)
demo(sys)
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
}
