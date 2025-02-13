import { Box, Button, DragHandle, drawrect, mouse, pset, root } from "./ui.js";



const box1 = new Box(10, 10, 20, 40, '#ff03');
root.children.push(box1);

const box2 = new Box(3, 3, 10, 10, '#0ff3');
box1.children.push(box2);

const button = new Button(0, 30, 5, 5, '#f007');
box1.children.push(button);

const handle = new DragHandle(box1, 0, 0, 8, 8, '#0003');
box1.children.push(handle);

button.onClick = () => {
  console.log('clicked', button.mouse.x, button.mouse.y);
};

button.draw = () => {
  let col = '#00f';
  if (button.hovered) col = '#0f0';
  if (button.clicking) col = '#fff';

  drawrect(0, 0, button.w, button.h, col);
  pset(0, 0, '#fff');
};


const cursor = new Box(0, 0, 320, 180);
cursor.passthrough = true;
cursor.draw = () => pset(mouse.x, mouse.y, '#00f');
root.children.push(cursor);
