import { canvas, COLORS, ctx, openCRT } from "./crt";

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

const crt = openCRT();
crt.update = (t: number, delta: number) => {
  // maybe grow trees
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      const tile = tiles[y][x];
      if (tile.type === 'tree') {
        if (tile.age > 10) {
          tile.age = 0;

          for (let yy = 0; yy < 3; yy += 2) {
            for (let xx = 0; xx < 3; xx += 2) {
              const x2 = x + xx - 1;
              const y2 = y + yy - 1;

              if (x2 >= 0 && y2 >= 0 && x2 < 320 && y2 < 180) {
                const nei = tiles[y2][x2];

                if (nei.type === 'grass') {
                  if (Math.random() > 0.01) {
                    nei.type = 'tree';
                    nei.age = 0;
                  }
                }
              }

            }
          }
        }
        tile.age += delta;
      }
    }
  }

  // draw each tile
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      ctx.fillStyle = colors[tiles[y][x].type];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // draw selection
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
};

canvas.onmouseup = () => {
  drag = null;
};
