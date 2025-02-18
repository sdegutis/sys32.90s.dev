import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Label } from "./crt/label.js";
import { makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { make, Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;




screen.root.children = [
  make(screen, SplitBox, { pos: 10, min: 8, max: 18, dir: 'y', resizable: true },
    make(screen, Box, { background: 0x000033ff }),
    make(screen, SplitBox, { pos: 30, min: 28, max: 8, dir: 'x', resizable: true },
      make(screen, Box, { background: 0x330000ff, layout: vacuumLayout },
        make(screen, Button, { background: 0x00000033, border: 0xff000033, onClick: () => console.log('clicked') },
          make(screen, Label, { text: 'hello\nworld' })
        )
      ),
      make(screen, Box, { background: 0x003300ff, layout: makeFlowLayout(3, 3) },
        ...Array(20).fill(0).map((_, i) => make(screen, Button, { padding: 2, background: 0x00000033, border: 0x999999ff, onClick: () => console.log('color', i) },
          randomColorSquare(Math.floor(i / 3) + 6)
        ))
      ),
    ),
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
