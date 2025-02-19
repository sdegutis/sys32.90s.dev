import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Label } from "./crt/label.js";
import { makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { makeBuilder, Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;

const b = makeBuilder(screen);

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
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('save') } }, b(Label, { text: 'save' })),
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('load') } }, b(Label, { text: 'load' })),
        b(Button, { border: 0, padding: 0, onClick: () => { console.log('grid') } }, b(Label, { text: 'grid' })),
      ),
      b(Box, { background: 0x333333ff, },
        b(Button, {},
          b(Label, { text: 'hey' })
        ),
      ),
    ),

  ),
];

screen.layoutTree();
