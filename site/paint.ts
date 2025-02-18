import { BorderBox, Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Label } from "./crt/label.js";
import { makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";


const canvas = document.querySelector('canvas')!;
// canvas.width = 320 * 2;
// canvas.height = 180 * 2;
const screen = new Screen(canvas);
screen.autoscale();

screen.root.layout = vacuumLayout;

const split = new SplitBox(screen);
split.pos = 10;
split.min = 8;
split.max = 18;
split.dir = 'y';

const red = new BorderBox(screen); red.background = 0x330000ff; red.border = 0xffffff00;
const green = new BorderBox(screen); green.background = 0x003300ff; green.border = 0xffffff00;
const blue = new BorderBox(screen); blue.background = 0x000033ff; blue.border = 0xffffff00;

const split2 = new SplitBox(screen);
split2.resizable = true;
split2.pos = 30;
split2.min = 28;
split2.max = 38;
split2.dir = 'x';

screen.root.children.push(split);

split.a.layout = vacuumLayout;
split.b.layout = vacuumLayout;
split2.a.layout = vacuumLayout;
split2.b.layout = vacuumLayout;

split.a.children.push(blue);
split.b.children.push(split2);

split2.a.children.push(red);
split2.b.children.push(green);

split.resizable = true;








const button = new Button(screen);
button.x = 30;
button.y = 30;
button.background = 0x00000033;
button.border = 0xff000033;
green.children.push(button);

const label = new Label(screen, 'yes \\n no');

button.child = label;
button.onClick = () => console.log('clicked')

// button.children.push(label);



green.background = 0x222222ff;


for (let i = 0; i < 20; i++) {
  const b = new Button(screen);
  b.padding = 2;
  b.x = 90;
  b.y = 30;
  b.background = 0x00000033;
  b.border = 0x999999ff;
  b.child = randomColorSquare(Math.floor(i / 3) + 6);
  green.children.push(b);
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

function randomColorSquare(size: number) {
  const color = (Math.random() * 0xffffff00) | 0x000000ff;
  size = 3;
  // const size = Math.floor(Math.random() * 5 + 3);
  const b = new Box(screen);
  b.background = color;
  b.passthrough = true;
  b.w = size;
  b.h = size;
  return b;
}




green.layout = makeFlowLayout(3, 3);

screen.layoutTree();
