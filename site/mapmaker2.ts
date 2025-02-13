import { Box, mouse, mousingOver, pset, rectfill, root } from "./ui.js";

root.background = '#000';

const mapArea = new Box(40, 0, 320 - 40, 180, '#222');
mapArea.clips = true;
root.children.push(mapArea);



const toolArea = new Box(0, 0, 40, 180, '#333');
root.children.push(toolArea);


mapArea.drawCursor = () => {
  rectfill(mouse.x, mouse.y - 3, 1, 7, '#0007');
  rectfill(mouse.x - 3, mouse.y, 7, 1, '#0007');
  pset(mouse.x, mouse.y, '#fff');
}

const cursor = new Box(0, 0, 320, 180);
cursor.passthrough = true;
cursor.draw = () => mousingOver.drawCursor();
root.children.push(cursor);
