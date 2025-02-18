import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Checkbox } from "./crt/checkbox.js";
import { Label } from "./crt/label.js";
import { makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { RadioButton, RadioGroup } from "./crt/radio.js";
import { make, Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";
import { TextField } from "./crt/textfield.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;









const radios = new RadioGroup();
radios.onChange = () => console.log('radio', radios.selected)





const checkbox = make(screen, Checkbox, {
  text: 'hello world',
  onChange: () => {
    console.log('checked', checkbox.checked)
  }
});


const tf = make(screen, TextField, {
  background: 0x000000aa,
  border: 0xffffff77,
  color: 0xffffffff,
  padding: 3,
  length: 3,
  text: 'n',
});

tf.onFocus = () => {
  radios.select(undefined);
  checkbox.checked = !checkbox.checked;
  console.log('asdf')
  // screen.needsRedraw = true;
}

tf.onChange = () => console.log('onchange', tf.text)
tf.onEnter = () => console.log('onemter', tf.text)

const testpaint = make(screen, Box, { background: 0x003300ff, layout: makeFlowLayout(3, 2) },
  ...Array(20).fill(0).map((_, i) => make(screen, RadioButton, {
    group: radios, padding: 2, background: 0x000000ff, border: 0x333333ff,

  },
    randomColorSquare(Math.floor(i / 3) + 6)
  )),
  tf,
  checkbox,
);

const split2 = make(screen, SplitBox, { pos: 30, min: 28, max: 8, dir: 'x', resizable: true },
  make(screen, Box, { background: 0x330000ff, layout: makeFlowLayout(3, 3) },
    make(screen, Button, {
      background: 0x00000033, border: 0xff000033, onClick: () => {
        import('./uitest.js').then((mod) => {
          split2.children[1] = mod.default(screen);
          screen.layoutTree(split2);
        });
      }
    },
      make(screen, Label, { text: 'ui test' })
    ),
    make(screen, Button, {
      background: 0x00000033, border: 0xff000033, onClick: () => {
        import('./mapmaker.js').then((mod) => {
          split2.children[1] = mod.default(screen);
          screen.layoutTree(split2);
        });
      }
    },
      make(screen, Label, { text: 'mapmaker' })
    ),
    make(screen, Button, {
      background: 0x00000033, border: 0xff000033, onClick: () => {
        split2.children[1] = testpaint;
        screen.layoutTree(split2);
      }
    },
      make(screen, Label, { text: 'paint' })
    ),
  ),
  testpaint
);

screen.root.children = [
  make(screen, SplitBox, { pos: 10, min: 8, max: 18, dir: 'y', resizable: true },
    make(screen, Box, { background: 0x000033ff }),
    split2,
  )
];

function randomColorSquare(size: number) {
  const color = (Math.random() * 0xffffff00) | 0x000000ff;
  size = 3;
  return make(screen, Box, { background: color, passthrough: true, w: size, h: size });
}




// button2.onMouseDown = (t) => {
//   t({
//     move: () => {

//     },
//     up: () => {
//       screen.pset(screen.mouse.x, screen.mouse.y, 0xffffff99)
//       console.log(screen.#hovered.mouse.x, screen.#hovered.mouse.y, screen.#hovered)

//     },
//   })
// };


screen.layoutTree();
