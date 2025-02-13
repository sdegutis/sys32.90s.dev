import { Box, mouse, mousingOver, pset, rectfill, root } from "./ui.js";

root.background = '#000';

const mapArea = new Box(40, 0, 320 - 40, 180, '#222');
mapArea.clips = true;
root.children.push(mapArea);

const toolArea = new Box(0, 0, 40, 180, '#333');
root.children.push(toolArea);

mapArea.drawCursor = () => {
  rectfill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  rectfill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  pset(mouse.x, mouse.y, '#fff');
}

mapArea.draw = () => {
  mapArea.drawBackground();
}
