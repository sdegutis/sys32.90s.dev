import { BorderBox, Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Label } from "./crt/label.js";
import { centerLayout, makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;




screen.root.children = [screen.make(SplitBox, { pos: 10, min: 8, max: 18, dir: 'y', resizable: true },
  screen.make(BorderBox, { background: 0x000033ff }),
  screen.make(SplitBox, { pos: 30, min: 28, max: 8, dir: 'x', resizable: true },
    screen.make(BorderBox, { background: 0x330000ff, layout: centerLayout },
      screen.make(Button, { background: 0x00000033, border: 0xff000033, onClick: () => console.log('clicked') },
        screen.make(Label, { text: 'hello\nworld' })
      )
    ),
    screen.make(BorderBox, { background: 0x003300ff, layout: makeFlowLayout(3, 3) },
      ...Array(20).fill(0).map((_, i) => screen.make(Button, { padding: 2, background: 0x00000033, border: 0x999999ff, onClick: () => console.log('color', i) },
        randomColorSquare(Math.floor(i / 3) + 6)
      ))
    ),
  ),
)];




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

function randomColorSquare(size: number) {
  const color = (Math.random() * 0xffffff00) | 0x000000ff;
  size = 3;
  return screen.make(Box, { background: color, passthrough: true, w: size, h: size });
}


screen.layoutTree();
