import { Box, DragHandle, mouse, pset, root } from "./ui.js";



root.background = '#000';

const box1 = new Box(10, 10, 20, 40, '#ff03');
root.children.push(box1);

const box2 = new Box(3, 3, 15, 30, '#0ff3');
box1.children.push(box2);

const box3 = new Box(2, 2, 10, 10, '#fff7');
box2.children.push(box3);

const handle = new DragHandle(box2, 1, 1, 4, 4, '#0003');
box2.children.push(handle);

box1.clips = true;


const cursor = new Box(0, 0, 320, 180);
cursor.passthrough = true;
cursor.draw = () => pset(mouse.x, mouse.y, '#00f');
root.children.push(cursor);
