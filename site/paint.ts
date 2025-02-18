import { Box } from "./crt/box.js";
import { centerLayout, vacuumLayout } from "./crt/layouts.js";
import { make, Screen } from "./crt/screen.js";
import { TextField } from "./crt/textfield.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;


const textfield = make(screen, TextField, {
  background: 0x000000aa,
  border: 0xffffff77,
  color: 0xffffffff,
  padding: 3,
  length: 3,
  text: '',
});

// textfield.onChange = () => console.log('onChange', textfield.text)
// textfield.onEnter = () => console.log('onEnter', textfield.text)

screen.root.children = [
  make(screen, Box, { background: 0x222222ff, layout: centerLayout },
    textfield
  )
];

screen.focus(textfield)

screen.layoutTree();
