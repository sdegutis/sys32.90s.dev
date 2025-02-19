import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Checkbox } from "./crt/checkbox.js";
import { Group } from "./crt/group.js";
import { Label } from "./crt/label.js";
import { centerLayout, vacuumLayout } from "./crt/layouts.js";
import { dragMove } from "./crt/selections.js";
import { SplitBox } from "./crt/split.js";
import { makeBuilder, System } from "./crt/system.js";
import mapmaker from "./mapmaker.js";


const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
sys.resize(320 * 2, 180 * 2);
sys.autoscale();
sys.root.layout = vacuumLayout;

const b = makeBuilder(sys);

let x = 10;

function makeWindow(title: string, content: Box) {
  const titlebar = b(Box, {
    h: 10, background: 0x00000033,
    onMouseDown: () => sys.trackMouse({ move: dragMove(sys, win) }),
  },
    b(Label, { text: title })
  );
  const contentView = b(Box, { layout: vacuumLayout, padding: 2 },
    content
  );
  const win = b(Box, { w: 100, h: 100, padding: 2, background: 0x00000099, layout: vacuumLayout },
    b(SplitBox, { dir: 'y', vacuum: 'a', padding: 2 },
      titlebar,
      contentView
    )
  );

  return win;
}

const area = b(Box, { background: 0x333333ff, layout: centerLayout },

  b(Group, { padding: 3, background: 0xffffff33 },

    b(Label, { text: 'hello', background: 0x00000077, padding: 3 }),

    b(Button, { onClick: () => { console.log('button') } },
      b(Label, { text: 'hello', background: 0x00000077, padding: 3 })
    ),

    checkboxes(sys),

  )

);

function one() {
  const a = makeWindow('mapmaker', mapmaker(sys));

  a.x = x;
  a.y = x;
  x += 30;

  sys.root.children.push(a);
  sys.layoutTree();
}

sys.root.children = [
  b(Box, { layout: vacuumLayout },
    b(SplitBox, { vacuum: 'a', dir: 'y' },
      b(Group, { background: 0x222222ff },
        b(Button, { onClick: one, padding: 1 }, b(Label, { text: 'one' })),
      ),
      area,
    )
  )
];

one();

sys.layoutTree();

function checkboxes(sys: System) {
  const b = makeBuilder(sys);
  return b(Group, { gap: 2 },

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

  );
}
