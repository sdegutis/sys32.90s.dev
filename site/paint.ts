import { Box, MouseTracker } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Checkbox } from "./crt/checkbox.js";
import { Group } from "./crt/group.js";
import { Label } from "./crt/label.js";
import { makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { build, makeBuilder, Screen } from "./crt/screen.js";
import { dragMove } from "./crt/selections.js";
import { SplitBox } from "./crt/split.js";


const canvas = document.querySelector('canvas')!;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;

class MyCheckbox extends Checkbox {

  constructor(screen: Screen) {
    super(screen);
    this.text = 'hey'
    // this.children = []

    this.checkmark.w = this.checkmark.h = 3;
    this.label.padding = 2;

  }

  // override adjust(): void {
  //   this.w = 30;
  //   this.h = 5;
  // }

  // override draw(): void {
  //   screen.rectFill(0, 0, this.w, this.h, this.checked ? 0x009900ff : 0x000099ff)
  // }

}

function dragBox(track: MouseTracker, box: Box) {
  const move = dragMove(box.screen, box);
  track({ move });
}


const b = makeBuilder(screen);

const panel = b(SplitBox, {
  x: 30, y: 50, w: 40, h: 50, pos: 4, dir: 'y', background: 0x00000077,
},
  build(screen, Box, {
    background: 0x00000077,
    onMouseDown: track => dragBox(track, panel),
  }),
  build(screen, Box, { layout: makeFlowLayout(3, 2) },
    build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 0 })),
    build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 1 })),
    build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 2 })),
  ),
);

screen.root.children = [
  b(SplitBox, { pos: 320 / 2, dir: 'x' },

    b(SplitBox, { pos: 8, dir: 'y', },
      b(Box, { background: 0x002244ff, layout: makeFlowLayout(0, 1) },
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('save1') } }, b(Label, { text: 'save' })),
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('load1') } }, b(Label, { text: 'load' })),
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('grid1') } }, b(Label, { text: 'grid' })),
      ),
      b(Box, { background: 0x444444ff }),
    ),
    b(SplitBox, { pos: 8, dir: 'y', },
      b(Box, { background: 0x002244ff, layout: makeFlowLayout(0, 1) },
        b(Button, {
          border: 0, padding: 0, onClick: () => {
            screen.resize(320 * 1, 180 * 1);

          }
        }, b(Label, { text: 'save' })),
        b(Button, {
          border: 0, padding: 0, onClick: () => {

            screen.resize(320 * 2, 180 * 2);

          }
        }, b(Label, { text: 'load' })),
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('grid') } }, b(Label, { text: 'grid' })),
      ),
      b(Box, { background: 0x333333ff, layout: makeFlowLayout(10, 2) },
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, text: 'a' }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 0 }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 1 }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 2 }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 3 }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 0, text: 'a' }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 1, text: 'ab' }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 2, text: 'abc' }),
        b(Checkbox, { border: 0x990000ff, background: 0x000099ff, check: 0x009900ff, padding: 3, text: 'abc' }),
        b(MyCheckbox, { background: 0x000099ff }),
        b(Group, { background: 0x003300ff, dir: 'x' },
          build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 0 })),
          build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 1 })),
          build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 2 })),
        ),
        b(Group, { background: 0x003300ff, dir: 'y' },
          build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 0 })),
          build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 1 })),
          build(screen, Button, {}, build(screen, Label, { text: 'hey', padding: 2 })),
        ),
      ),
    ),

  ),
  panel,

];

screen.layoutTree();
