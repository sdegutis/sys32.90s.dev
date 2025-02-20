import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Checkbox } from "./crt/checkbox.js";
import { Group } from "./crt/group.js";
import { Label } from "./crt/label.js";
import { centerLayout, makeVacuumLayout } from "./crt/layouts.js";
import { RadioButton, RadioGroup } from "./crt/radio.js";
import { dragMove, dragResize } from "./crt/selections.js";
import { SplitBox } from "./crt/split.js";
import { makeBuilder, System } from "./crt/system.js";
import mapmaker from "./mapmaker.js";





const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
// sys.resize(320 * 2, 180 * 2);
sys.autoscale();
sys.root.layout = makeVacuumLayout();

const b = makeBuilder(sys);

let x = 10;

function makeWindow(title: string, content: Box) {
  const titlebar = b(Group, {
    padding: 1,
    onMouseDown: () => {
      if (sys.keys['Control']) {
        const resize = dragResize(sys, win);
        sys.trackMouse({
          move: () => {
            resize();
            sys.layoutTree(win);
          }
        });
      }
      else {
        sys.trackMouse({ move: dragMove(sys, win) });
      }
    },
  },
    b(Label, { text: title, color: 0xffffff33 }),
    b(Box, { w: 3 }),
    b(Button, {
      onClick: () => {
        const i = sys.root.children.indexOf(win);
        sys.root.children.splice(i, 1);
      }
    },
      b(Label, { text: 'x' })
    )
  );
  const contentView = b(Group, { layout: makeVacuumLayout(1) },
    content
  );
  const win = b(Box, { w: 100, h: 100, background: 0x000000aa, layout: makeVacuumLayout(1) },
    b(SplitBox, { dir: 'y', vacuum: 'a' },
      titlebar,
      contentView,
    )
  );

  return win;
}

const group = new RadioGroup();

const area = b(Box, { background: 0x333333ff, layout: centerLayout },

  b(Group, { padding: 1, gap: 2, background: 0xffffff33 },

    b(RadioButton, { group, size: 4, padding: 1 }),
    b(RadioButton, { group, size: 4, padding: 1 }),
    b(RadioButton, { group, size: 4, padding: 1 }),

    b(Label, { text: 'hello', background: 0x00000077, padding: 3 }),

    b(Checkbox, { checked: true, padding: 0, size: 4 }),
    b(Checkbox, { checked: true, padding: 1, size: 4 }),

    b(Button, { onClick: () => { console.log('button') } },
      b(Label, { text: 'hello', background: 0x00000077, padding: 3 })
    ),

    b(Checkbox, { checked: true, }),

    b(Checkbox, { checked: true, padding: 0 }),
    b(Checkbox, { checked: true, padding: 1 }),
    b(Checkbox, { checked: true, padding: 2 }),
    b(Checkbox, { checked: true, padding: 3 }),
    b(Checkbox, { checked: true, padding: 4 }),
    b(Checkbox, { checked: true, padding: 5 }),

    b(Checkbox, { checked: true, size: 0, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 1, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 2, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 3, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 4, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 5, padding: 2, checkColor: 0x990000ff }),

    b(Checkbox, { checked: true, size: 0 }),
    b(Checkbox, { checked: true, size: 1 }),
    b(Checkbox, { checked: true, size: 2 }),
    b(Checkbox, { checked: true, size: 3 }),
    b(Checkbox, { checked: true, size: 4 }),
    b(Checkbox, { checked: true, size: 5 }),

    b(Group, {
      gap: 2,
      onMouseEnter() { this.firstChild!.onMouseEnter!() },
      onMouseExit() { this.firstChild!.onMouseExit!() },
      onMouseDown() { this.firstChild!.onMouseDown!() },
    },
      b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
      b(Label, { text: 'foo' }),
    ),

    b(Group, {
      gap: 2,
      onMouseEnter() { this.lastChild!.onMouseEnter!() },
      onMouseExit() { this.lastChild!.onMouseExit!() },
      onMouseDown() { this.lastChild!.onMouseDown!() },
    },
      b(Label, { text: 'bar' }),
      b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
    ),


  )

);

function newMapmaker() {
  const win = makeWindow('mapmaker', mapmaker(sys));

  win.x = x;
  win.y = x;
  x += 30;

  sys.root.children.push(win);
  sys.layoutTree();
}

sys.root.children = [
  b(Box, { layout: makeVacuumLayout() },
    b(SplitBox, { vacuum: 'a', dir: 'y' },
      b(Group, { background: 0x222222ff },
        b(Button, { onClick: newMapmaker, padding: 1 }, b(Label, { text: 'one' })),
      ),
      area,
    )
  )
];

newMapmaker();

sys.layoutTree();
