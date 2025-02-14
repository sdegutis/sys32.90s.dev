import { Box, Button, Dragging, keys, rectfill, root } from "./ui.js";

root.background = '#000';


const toolArea = new Box(0, 8, 40, 180 - 8, '#333');
root.children.push(toolArea);

const menu = new Box(0, 0, 320, 6, '#000');
root.children.push(menu);


const saveButton = new Button(1, 1, 4 * 4 + 1, 6, '#000');
saveButton.color = '#fff3';
saveButton.text = 'save';
saveButton.onClick = () => {
  console.log('saving')
};
menu.children.push(saveButton);

const loadButton = new Button(20, 1, 4 * 4 + 1, 6, '#000');
loadButton.color = '#fff3';
loadButton.text = 'load';
loadButton.onClick = () => {
  console.log('loading')
};
menu.children.push(loadButton);


const mapArea = new Box(40, 8, 320 - 40, 180 - 8, '#222');
mapArea.clips = true;
root.children.push(mapArea);





const map = new Box(0, 0, 50 * 4, 50 * 4, '#070');
mapArea.children.push(map);

map.drawCursor = () => {
  // rectfill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  // rectfill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  // pset(mouse.x, mouse.y, '#fff');
}

map.onMouseDown = () => {
  if (keys[' ']) {
    const dragger = new Dragging(map);
    const done = map.trackMouse({
      move: () => dragger.update(),
      up: () => done(),
    });
  }
};

map.draw = () => {
  map.drawBackground();

  for (let i = 0; i < 50; i++) {
    rectfill(0, i * 4, 50 * 4, 1, '#0001');
    rectfill(i * 4, 0, 1, 50 * 4, '#0001');
  }

  const tx = Math.floor(map.mouse.x / 4);
  const ty = Math.floor(map.mouse.y / 4);

  rectfill(tx * 4, ty * 4, 4, 4, '#00f7');
}
