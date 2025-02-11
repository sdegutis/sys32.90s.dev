import { canvas, COLORS, ctx, openCRT } from "./crt";

const crt = openCRT();

type Tile = {
  type: 'grass' | 'tree' | 'farmer',
  x: number,
  y: number,
  age: number,
};

const tiles: Tile[][] = [];
for (let y = 0; y < 180; y++) {
  const row: Tile[] = [];
  tiles.push(row);
  for (let x = 0; x < 320; x++) {
    row.push({ type: 'grass', x, y, age: 0 });
  }
}

const colors: { [K in Tile['type']]: string } = {
  grass: COLORS[3],
  tree: COLORS[11],
  farmer: COLORS[7],
};

for (let y = 20; y < 50; y++) {
  for (let x = 30; x < 40; x++) {
    tiles[y][x].type = 'tree';
  }
}

tiles[100][100].type = 'farmer';

let drag: { x: number, y: number } | null = null;

function maybeGrow(x: number, y: number) {
  if (x < 0 || y < 0 || x >= 320 || y >= 180) return;
  if (tiles[y][x].type === 'grass') {
    if (Math.random() > 0.25) {
      tiles[y][x].type = 'tree';
      tiles[y][x].age = 0;
    }
  }
}

crt.update = (t: number, delta: number) => {
  // maybe grow trees
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      const tile = tiles[y][x];
      if (tile.type === 'tree') {
        if (tile.age > 1000) {

          for (let xx = -1; xx <= 1; xx += 2) {
            for (let yy = -1; yy <= 1; yy += 2) {
              maybeGrow(x + xx, y + yy);
            }
          }

        }
        tile.age += delta;
      }
    }
  }

  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      ctx.fillStyle = colors[tiles[y][x].type];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  if (drag) {
    ctx.strokeStyle = '#00f3';
    ctx.strokeRect(
      drag.x + .5,
      drag.y + .5,
      crt.mouse.x - drag.x,
      crt.mouse.y - drag.y
    );
  }

  // draw mouse
  ctx.fillStyle = '#0007';
  ctx.fillRect(crt.mouse.x - 2, crt.mouse.y - 2, 5, 5);
  ctx.fillStyle = '#fff';
  ctx.fillRect(crt.mouse.x, crt.mouse.y, 1, 1);
};

canvas.onmousedown = () => {
  drag = { x: crt.mouse.x, y: crt.mouse.y };
  canvas.onmouseup = () => {
    drag = null;
  };
};
