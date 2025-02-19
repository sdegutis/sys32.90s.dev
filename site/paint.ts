import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Checkbox } from "./crt/checkbox.js";
import { Label } from "./crt/label.js";
import { centerLayout, makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { make, Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;



// textfield.onChange = () => console.log('onChange', [textfield.text])
// textfield.onEnter = () => console.log('onEnter', [textfield.text])

screen.root.children = [
  make(screen, SplitBox, { pos: 320 / 2, dir: 'x' },

    make(screen, SplitBox, { pos: 8, dir: 'y', },
      make(screen, Box, { background: 0x222222ff, layout: makeFlowLayout(0, 1) },
        make(screen, Button, { border: 0, padding: 0, onClick: () => { console.log('save1') } }, make(screen, Label, { text: 'save' })),
        make(screen, Button, { border: 0, padding: 0, onClick: () => { console.log('load1') } }, make(screen, Label, { text: 'load' })),
        make(screen, Button, { border: 0, padding: 0, onClick: () => { console.log('grid1') } }, make(screen, Label, { text: 'grid' })),
      ),
      make(screen, Box, { background: 0x444444ff }),
    ),
    make(screen, SplitBox, { pos: 8, dir: 'y', },
      make(screen, Box, { background: 0x222222ff, layout: makeFlowLayout(0, 1) },
        make(screen, Button, { border: 0, padding: 0, onClick: () => { console.log('save') } }, make(screen, Label, { text: 'save' })),
        make(screen, Button, { border: 0, padding: 0, onClick: () => { console.log('load') } }, make(screen, Label, { text: 'load' })),
        make(screen, Button, { border: 0, padding: 0, onClick: () => { console.log('grid') } }, make(screen, Label, { text: 'grid' })),
      ),
      make(screen, Box, { background: 0x333333ff, },
        make(screen, Button, {},
          make(screen, Label, { text: 'hey' })
        ),
      ),
    ),

  ),
];

screen.layoutTree();
