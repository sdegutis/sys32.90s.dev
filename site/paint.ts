import { Box } from "./crt/box.js";
import { Checkbox } from "./crt/checkbox.js";
import { centerLayout, makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { make, Screen } from "./crt/screen.js";
import { TextField } from "./crt/textfield.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;



// textfield.onChange = () => console.log('onChange', [textfield.text])
// textfield.onEnter = () => console.log('onEnter', [textfield.text])

screen.root.children = [
  make(screen, Box, { background: 0x777777ff, layout: makeFlowLayout(50, 10), },
    make(screen, Checkbox, { text: '', background: 0x222222ff, padding: 0 }),
    make(screen, Checkbox, { text: 'i', background: 0x222222ff, padding: 0 }),
    make(screen, Checkbox, { text: 'hi', background: 0x222222ff, padding: 0 }),
    make(screen, Checkbox, { text: 'hello', background: 0x222222ff, padding: 0 }),
    make(screen, Checkbox, { text: '', background: 0x222222ff, padding: 2 }),
    make(screen, Checkbox, { text: 'i', background: 0x222222ff, padding: 2 }),
    make(screen, Checkbox, { text: 'hi', background: 0x222222ff, padding: 2 }),
    make(screen, Checkbox, { text: 'hello', background: 0x222222ff, padding: 2 }),
  )
];

screen.layoutTree();
