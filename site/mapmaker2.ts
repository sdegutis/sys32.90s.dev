import { Box, Button, Mover, keys, rectFill, rectLine, root, Selection } from "./ui.js";

root.background = '#000';


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






const toolArea = new Box(0, 8, 40, 180 - 8, '#333');
root.children.push(toolArea);







const mapArea = new Box(40, 8, 320 - 40, 180 - 8, '#222');
mapArea.clips = true;
root.children.push(mapArea);

const map = new Box(0, 0, 50 * 4, 50 * 4);
mapArea.children.push(map);

map.drawCursor = () => {
  // rectfill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  // rectfill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  // pset(mouse.x, mouse.y, '#fff');
}

let dragger: Selection | null = null;

map.onMouseDown = () => {
  if (keys[' ']) {
    const dragger = new Mover(map);
    map.trackMouse({ move: () => dragger.update() });
  }
  else {

    dragger = new Selection(map);

    map.trackMouse({
      move() {
        dragger!.update();

        const tx = Math.floor(map.mouse.x / 4);
        const ty = Math.floor(map.mouse.y / 4);
      },
      up() {
        dragger = null;
      },
    });

  }
};

map.draw = () => {
  rectFill(0, 0, map.w, map.h, '#070');

  for (let i = 0; i < 50; i++) {
    rectFill(0, i * 4, 50 * 4, 1, '#0001');
    rectFill(i * 4, 0, 1, 50 * 4, '#0001');
  }

  if (map.hovered) {
    const tx = Math.floor(map.mouse.x / 4);
    const ty = Math.floor(map.mouse.y / 4);
    rectFill(tx * 4, ty * 4, 4, 4, '#00f7');
  }

  if (dragger) {
    const { x, y, w, h } = dragger;

    const tx1 = Math.floor(x / 4);
    const ty1 = Math.floor(y / 4);
    const tx2 = Math.ceil(x + w / 4);
    const ty2 = Math.ceil(y + h / 4);

    rectLine(tx1, ty1, tx2 - tx1, ty2 - ty1, '#000');
    rectFill(tx1, ty1, tx2 - tx1, ty2 - ty1, '#00f7');
  }
}
