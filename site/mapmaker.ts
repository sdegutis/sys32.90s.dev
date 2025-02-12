import { callbacks, COLORS, context, mouse } from "./crt.js";

const mapData = {
  width: 0,
  height: 0,
  terrain: [0],
  units: [0],
};

mapData.width = 200;
mapData.height = 200;
mapData.terrain = Array(mapData.width * mapData.height).fill(0);
mapData.units = Array(mapData.width * mapData.height).fill(0);

const drawTerrain: ((x: number, y: number) => void)[] = [
  (x, y) => {
    context.fillStyle = COLORS[3];
    context.fillRect(x, y, 4, 4);
  },
  (x, y) => {
    context.fillStyle = COLORS[5];
    context.fillRect(x, y, 4, 4);
  },
  (x, y) => {
    context.fillStyle = COLORS[4];
    context.fillRect(x, y, 4, 4);
  },
];

const drawUnit: ((x: number, y: number) => void)[] = [
  (x, y) => {
    // goldmine
    pset(6, x + 2, y + 1);
    pset(6, x + 1, y + 2);
    pset(6, x + 1, y + 3);
    pset(5, x + 3, y + 2);
    pset(5, x + 3, y + 3);
    pset(1, x + 2, y + 2);
    pset(1, x + 2, y + 3);
  },
  (x, y) => {
    // rock
    pset(6, x + 2, y + 1);
    pset(6, x + 3, y + 1);
    pset(6, x + 1, y + 2);
    pset(6, x + 2, y + 2);
    pset(6, x + 1, y + 3);
    pset(5, x + 2, y + 3);
    pset(5, x + 3, y + 3);
    pset(5, x + 3, y + 2);
  },
  (x, y) => {
    // tree
    pset(11, x + 1, y + 1);
    pset(11, x, y + 2);
    pset(11, x + 1, y + 2);
    pset(11, x + 2, y + 2);
    pset(5, x + 1, y + 3);
  },
  (x, y) => {
    // farmer
    pset(15, x + 1, y);
    pset(2, x + 1, y + 1);
    pset(1, x + 1, y + 2);
  },
];

for (let y = 10; y < 20; y++) {
  for (let x = 20; x < 30; x++) {
    const i = y * mapData.width + x;
    // mapData.terrain[i] = 2;
    mapData.units[i] = 4;
  }
}

callbacks.ontick = (delta: number) => {
  // draw each tile
  for (let y = 0; y < 45; y++) {
    for (let x = 0; x < 80; x++) {
      const i = y * mapData.width + x;
      drawTerrain[mapData.terrain[i]](x * 4, y * 4);
      const unit = mapData.units[i];
      if (unit > 0) {
        drawUnit[unit - 1](x * 4, y * 4);
      }
    }
  }

  // draw mouse selection
  if (mouse.drag) {
    const x1 = mouse.drag.x;
    const y1 = mouse.drag.y;
    const x2 = mouse.x;
    const y2 = mouse.y;

    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = x1 < x2 ? x2 - x1 : x1 - x2;
    const h = y1 < y2 ? y2 - y1 : y1 - y2;

    context.fillStyle = mouse.drag.b === 0 ? '#00f3' : '#f003';
    context.fillRect(x, y, w + 1, h + 1);

    context.strokeStyle = mouse.drag.b === 0 ? '#00f3' : '#f003';
    context.strokeRect(x + .5, y + .5, w, h);
  }

  // draw mouse
  context.fillStyle = '#0007';
  context.fillRect(mouse.x - 2, mouse.y, 5, 1);
  context.fillRect(mouse.x, mouse.y - 2, 1, 5);
  context.fillStyle = '#fff';
  context.fillRect(mouse.x, mouse.y, 1, 1);
};

function pset(c: number, x: number, y: number) {
  context.fillStyle = COLORS[c];
  context.fillRect(x, y, 1, 1);
}
