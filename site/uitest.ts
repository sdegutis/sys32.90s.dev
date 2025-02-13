import { Box, Button, DragHandle, drawrect, mouse, pset, root } from "./ui/screen.js";



const box1 = new Box('box1').build(10, 10, 20, 40, '#ff03');
root.children.push(box1);

const box2 = new Box('box2').build(3, 3, 10, 10, '#0ff3');
box1.children.push(box2);

const button = new Button('button').build(0, 30, 5, 5, '#f007');
box1.children.push(button);

const handle = new DragHandle('draghandle', box1).build(0, 0, 8, 8, '#0003');
box1.children.push(handle);

button.onClick = () => {
  console.log('clicked', mouse);
};

button.draw = () => {
  let col = '#00f';
  if (button.hovered) col = '#0f0';
  if (button.clicking) col = '#fff';

  drawrect(0, 0, button.w, button.h, col);
  pset(0, 0, '#fff');
};


const cursor = new Box('cursor').build(0, 0, 320, 180);
cursor.passthrough = true;
cursor.draw = () => pset(mouse.x, mouse.y, '#00f');
root.children.push(cursor);
