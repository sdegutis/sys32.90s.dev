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

let camx = 0;
let camy = 0;

let dragx = 0;
let dragy = 0;

callbacks.ontick = (delta: number) => {
  context.clearRect(0, 0, 320, 180);

  // draw each tile
  for (let y = 0; y < mapData.width; y++) {
    for (let x = 0; x < mapData.height; x++) {
      const i = y * mapData.width + x;
      const px = dragx + camx + x * 4;
      const py = dragy + camy + y * 4;

      drawTerrain[mapData.terrain[i]](px, py);
      const unit = mapData.units[i];
      if (unit > 0) {
        drawUnit[unit - 1](px, py);
      }

      context.strokeStyle = '#0001';
      context.strokeRect(px + 0.5, py + 0.5, 4, 4);
    }
  }

  // show hovered tile
  if (!mouse.drag) {
    context.fillStyle = '#00f';
    const tilex = Math.floor((mouse.x - camx) / 4);
    const tiley = Math.floor((mouse.y - camy) / 4);
    const mousex = tilex * 4 + camx;
    const mousey = tiley * 4 + camy;
    context.fillRect(mousex, mousey, 4, 4);
  }

  // draw mouse selection
  if (mouse.drag) {
    if (mouse.button > 0) {
      dragx = mouse.x - mouse.drag.x;
      dragy = mouse.y - mouse.drag.y;
    }
    else {
      const x1 = mouse.drag.x;
      const y1 = mouse.drag.y;
      const x2 = mouse.x;
      const y2 = mouse.y;

      const x = x1 < x2 ? x1 : x2;
      const y = y1 < y2 ? y1 : y2;
      const w = x1 < x2 ? x2 - x1 : x1 - x2;
      const h = y1 < y2 ? y2 - y1 : y1 - y2;

      context.fillStyle = mouse.button === 0 ? '#00f3' : '#f003';
      context.fillRect(x, y, w + 1, h + 1);

      context.strokeStyle = mouse.button === 0 ? '#00f3' : '#f003';
      context.strokeRect(x + .5, y + .5, w, h);

      for (let tilestepy = 0; tilestepy < h / 4 + 1; tilestepy++) {
        for (let tilestepx = 0; tilestepx < w / 4 + 1; tilestepx++) {
          const tx = Math.floor((x - camx) / 4 + tilestepx);
          const ty = Math.floor((y - camy) / 4 + tilestepy);
          const i = ty * mapData.width + tx;

          mapData.terrain[i] = 1;
        }
      }
    }
  }

  // draw mouse
  context.fillStyle = '#0007';
  context.fillRect(mouse.x - 2, mouse.y, 5, 1);
  context.fillRect(mouse.x, mouse.y - 2, 1, 5);
  context.fillStyle = '#fff';
  context.fillRect(mouse.x, mouse.y, 1, 1);
};

callbacks.ondragend = () => {
  camx += dragx;
  camy += dragy;

  dragx = 0;
  dragy = 0;
};

function pset(c: number, x: number, y: number) {
  context.fillStyle = COLORS[c];
  context.fillRect(x, y, 1, 1);
}
