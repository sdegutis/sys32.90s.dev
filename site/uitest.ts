import { Box, Button, DragHandle, rectLine, mouse, ontick, print, pset, rectFill, root } from "./ui.js";

const COLORS = [
  '#000000', '#1D2B53', '#7E2553', '#008751',
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436',
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
];



root.background = '#000';

const box1 = new Box(10, 10, 20, 40, '#ff03');
root.children.push(box1);

const box2 = new Box(3, 3, 10, 10, '#0ff3');
box1.children.push(box2);

const button = new Button(0, 30, 5, 5, '#f007');
box1.children.push(button);

const handle = new DragHandle(box1, 0, 0, 8, 8, '#fff3');
box1.children.push(handle);

button.onClick = () => {
  console.log('clicked', button.mouse.x, button.mouse.y);
};

button.draw = () => {
  let col = '#00f';
  if (button.hovered) col = '#0f0';
  if (button.clicking) col = '#fff';

  rectLine(0, 0, button.w, button.h, col);
  pset(0, 0, '#fff');

};

box2.draw = () => {
  box2.drawChildren();
  box2.drawBackground();
  print(1, 1, '#f00', 'test');
};


const cursor = new Box(0, 0, 320, 180);
cursor.passthrough = true;
cursor.draw = () => pset(mouse.x, mouse.y, '#00f');
root.children.push(cursor);

ontick(delta => {
  // rectfill(0, 0, 320, 180, '#000');


});
