import { callbacks, COLORS, context, keys, mouse } from "./crt.js";

const mapData = {
  width: 0,
  height: 0,
  terrain: [0],
  units: [0],
};

mapData.width = 200;
mapData.height = 200;
mapData.terrain = Array(mapData.width * mapData.height).fill(3);
mapData.units = Array(mapData.width * mapData.height).fill(0);

const drawTerrain: ((x: number, y: number) => void)[] = [];

for (let i = 0; i < 16; i++) {
  drawTerrain.push((x, y) => {
    context.fillStyle = COLORS[i];
    context.fillRect(x, y, 4, 4);
  });
}

function pset(c: number, x: number, y: number) {
  context.fillStyle = COLORS[c];
  context.fillRect(x, y, 1, 1);
}

const drawUnit: ((x: number, y: number) => void)[] = [
  (x, y) => { },
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

const tools: {
  map: number[],
  draw: (x: number, y: number) => void,
  offset: number,
}[] = [];

for (const draw of drawTerrain) {
  tools.push({ map: mapData.terrain, draw, offset: 0 });
}

for (const draw of drawUnit) {
  tools.push({ map: mapData.units, draw, offset: drawTerrain.length });
}

let tool = 1;

function setMapTile(index: number) {
  tools[tool].map[index] = tool - tools[tool].offset;
}

callbacks.onscroll = (up) => {
  if (!up) {
    tool--;
    if (tool < 0) tool = tools.length - 1;
  }
  else {
    tool++;
    if (tool === tools.length) tool = 0;
  }
};

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
      drawUnit[mapData.units[i]](px, py);

      context.strokeStyle = '#0001';
      context.strokeRect(px + 0.5, py + 0.5, 4, 4);
    }
  }

  // show hovered tile
  const tilex = Math.floor((mouse.x - camx) / 4);
  const tiley = Math.floor((mouse.y - camy) / 4);
  const mousex = tilex * 4 + camx;
  const mousey = tiley * 4 + camy;
  tools[tool].draw(mousex, mousey);

  context.strokeStyle = '#00f3';
  context.strokeRect(mousex - .5, mousey - .5, 5, 5);

  // draw mouse selection
  if (mouse.drag) {
    if (keys[' ']) {
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

      if (keys['Control']) {
        const tilex1 = Math.floor((x - camx) / 4);
        const tiley1 = Math.floor((y - camy) / 4);

        const tilex2 = Math.ceil((x + w - camx) / 4);
        const tiley2 = Math.ceil((y + h - camy) / 4);

        for (let y = tiley1; y < tiley2; y++) {
          for (let x = tilex1; x < tilex2; x++) {
            const i = y * mapData.width + x;
            setMapTile(i);
          }
        }
      }
      else if (keys['Alt']) {
        const tilex1 = Math.floor((mouse.x - camx) / 4);
        const tiley1 = Math.floor((mouse.y - camy) / 4);

        setMapTile((tiley1 * mapData.width + tilex1));
        setMapTile(((tiley1 + 1) * mapData.width + tilex1));
        setMapTile(((tiley1 - 1) * mapData.width + tilex1));
        setMapTile((tiley1 * mapData.width + tilex1 + 1));
        setMapTile((tiley1 * mapData.width + tilex1 - 1));
      }
      else {
        const tilex1 = Math.floor((mouse.x - camx) / 4);
        const tiley1 = Math.floor((mouse.y - camy) / 4);

        const i = tiley1 * mapData.width + tilex1;
        setMapTile(i);
      }
    }
  }
};

callbacks.ondragend = () => {
  camx += dragx;
  camy += dragy;

  dragx = 0;
  dragy = 0;
};
