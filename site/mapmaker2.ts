import { Box, Button, canvas, Dragging, keys, mouse, print, pset, rectfill, root } from "./ui.js";

root.background = '#000';


const toolArea = new Box(0, 0, 40, 180, '#333');
root.children.push(toolArea);


const saveButton = new Button(1, 1, 19, 8, '#0003');
saveButton.color = '#fff3';
saveButton.text = 'save';
toolArea.children.push(saveButton);


const mapArea = new Box(40, 0, 320 - 40, 180, '#222');
mapArea.clips = true;
root.children.push(mapArea);





const map = new Box(0, 0, 50 * 4, 50 * 4, '#070');
mapArea.children.push(map);

map.drawCursor = () => {
  rectfill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  rectfill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  pset(mouse.x, mouse.y, '#fff');
}

map.onMouseDown = () => {
  if (keys[' ']) {
    const dragger = new Dragging(map);
    const cancel = new AbortController();

    canvas.addEventListener('mousemove', () => {
      dragger?.update();
    }, { signal: cancel.signal });

    canvas.addEventListener('mouseup', () => {
      cancel.abort();
    }, { once: true });
  }
};

map.draw = () => {
  map.drawBackground();
  // print(1, 2, '#fff', 'testing');
}
