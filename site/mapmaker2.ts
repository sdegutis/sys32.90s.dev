import { Box, Button, Mover, TileSelection, keys, rectFill, rectLine, root } from "./ui.js";

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













const COLORS = [
  '#000000', '#1D2B53', '#7E2553', '#008751',
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436',
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
];

const mapData = {
  width: 50,
  height: 40,
  terrain: [] as number[],
  units: [] as number[],
};

mapData.terrain = Array(mapData.width * mapData.height).fill(3);
mapData.units = Array(mapData.width * mapData.height).fill(0);

const drawTerrain: ((x: number, y: number) => void)[] = [];

for (let i = 0; i < 16; i++) {
  drawTerrain.push((x, y) => {
    rectFill(x, y, 4, 4, COLORS[i]);
  });
}













const mapArea = new Box(40, 8, 320 - 40, 180 - 8, '#222');
mapArea.clips = true;
root.children.push(mapArea);

const map = new Box(0, 0, mapData.width * 4, mapData.height * 4);
mapArea.children.push(map);

map.drawCursor = () => {
  // rectfill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  // rectfill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  // pset(mouse.x, mouse.y, '#fff');
}

let tilesel: TileSelection | null = null;

map.onMouseDown = () => {
  if (keys[' ']) {
    const dragger = new Mover(map);
    map.trackMouse({ move: () => dragger.update() });
  }
  else {

    if (keys['Control']) {
      tilesel = new TileSelection(map);

      map.trackMouse({
        move() {
          tilesel!.update();

          const { tx1, tx2, ty1, ty2 } = tilesel!;

          for (let y = ty1; y < ty2; y++) {
            for (let x = tx1; x < tx2; x++) {
              mapData.terrain[(y * mapData.width + x)] = 5;
            }
          }

        },
        up() {
          tilesel = null;
        },
      });
    }
    else if (keys['Alt']) {
      map.trackMouse({
        move() {
          const x = Math.floor(map.mouse.x / 4);
          const y = Math.floor(map.mouse.y / 4);
          mapData.terrain[((y + 0) * mapData.width + (x + 0))] = 5;
          mapData.terrain[((y + 0) * mapData.width + (x + 1))] = 5;
          mapData.terrain[((y + 0) * mapData.width + (x - 1))] = 5;
          mapData.terrain[((y + 1) * mapData.width + (x + 0))] = 5;
          mapData.terrain[((y - 1) * mapData.width + (x + 0))] = 5;
        },
      });
    }
    else {
      map.trackMouse({
        move() {
          const x = Math.floor(map.mouse.x / 4);
          const y = Math.floor(map.mouse.y / 4);
          mapData.terrain[(y * mapData.width + x)] = 5;
        },
      });
    }

  }
};

map.draw = () => {
  // rectFill(0, 0, map.w, map.h, '#070');

  for (let y = 0; y < mapData.height; y++) {
    for (let x = 0; x < mapData.width; x++) {
      const i = y * mapData.width + x;
      const t = mapData.terrain[i];
      drawTerrain[t](x * 4, y * 4);
    }
  }

  for (let x = 0; x < mapData.width; x++) {
    rectFill(x * 4, 0, 1, mapData.height * 4, '#0001');
  }

  for (let y = 0; y < mapData.height; y++) {
    rectFill(0, y * 4, mapData.width * 4, 1, '#0001');
  }

  if (map.hovered) {
    const tx = Math.floor(map.mouse.x / 4);
    const ty = Math.floor(map.mouse.y / 4);
    rectFill(tx * 4, ty * 4, 4, 4, '#00f7');
  }

  if (tilesel) {
    const { tx1, tx2, ty1, ty2 } = tilesel;

    rectLine(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), '#00f3');
    rectFill(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), '#00f3');
  }
}
