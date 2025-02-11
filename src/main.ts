import { canvas, COLORS, ctx, openCRT } from "./crt";

type Tile = {
  type: 'grass' | 'tree' | 'farmer',
  x: number,
  y: number,
  age: number,
};

// 80 x 45

const tiles: Tile[][] = [];
for (let y = 0; y < 45; y++) {
  const row: Tile[] = [];
  tiles.push(row);
  for (let x = 0; x < 80; x++) {
    row.push({ type: 'grass', x, y, age: 0 });
  }
}

const draw: { [K in Tile['type']]: (x: number, y: number) => void } = {
  grass: (x, y) => {
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(x, y, 4, 4);
  },
  tree: (x, y) => {
    draw.grass(x, y);

    ctx.fillStyle = COLORS[11];
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillRect(x, y + 2, 1, 1);
    ctx.fillRect(x + 1, y + 2, 1, 1);
    ctx.fillRect(x + 2, y + 2, 1, 1);
    ctx.fillStyle = COLORS[5];
    ctx.fillRect(x + 1, y + 3, 1, 1);
  },
  farmer: (x, y) => {
    draw.grass(x, y);

    ctx.fillStyle = COLORS[15];
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillStyle = COLORS[2];
    ctx.fillRect(x + 1, y + 1, 1, 1);
    ctx.fillStyle = COLORS[1];
    ctx.fillRect(x + 1, y + 2, 1, 1);

    // hand
    ctx.fillStyle = COLORS[2];
    ctx.fillRect(x + 2, y + 1, 1, 1);
  },
};

for (let y = 10; y < 20; y++) {
  for (let x = 20; x < 30; x++) {
    tiles[y][x].type = 'tree';
  }
}

tiles[25][40].type = 'farmer';

let drag: { x: number, y: number } | null = null;

const crt = openCRT();
crt.update = (t: number, delta: number) => {
  // // maybe grow trees
  // for (let y = 0; y < 180; y++) {
  //   for (let x = 0; x < 320; x++) {
  //     const tile = tiles[y][x];
  //     if (tile.type === 'tree') {
  //       if (tile.age > 1000) {
  //         tile.age = 0;

  //         for (let yy = 0; yy < 3; yy += 2) {
  //           for (let xx = 0; xx < 3; xx += 2) {
  //             const x2 = x + xx - 1;
  //             const y2 = y + yy - 1;

  //             if (x2 >= 0 && y2 >= 0 && x2 < 320 && y2 < 180) {
  //               const nei = tiles[y2][x2];

  //               if (nei.type === 'grass') {
  //                 if (Math.random() > 0.99) {
  //                   nei.type = 'tree';
  //                   nei.age = 0;
  //                 }
  //               }
  //             }

  //           }
  //         }
  //       }
  //       tile.age += delta;
  //     }
  //   }
  // }

  // draw each tile
  for (let y = 0; y < 45; y++) {
    for (let x = 0; x < 80; x++) {
      const fn = draw[tiles[y][x].type];
      fn(x * 4, y * 4);
    }
  }

  // draw mouse selection
  if (drag) {
    const x1 = drag.x;
    const y1 = drag.y;
    const x2 = crt.mouse.x;
    const y2 = crt.mouse.y;

    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = x1 < x2 ? x2 - x1 : x1 - x2;
    const h = y1 < y2 ? y2 - y1 : y1 - y2;

    ctx.fillStyle = '#00f3';
    ctx.fillRect(x, y, w + 1, h + 1);

    ctx.strokeStyle = '#00f3';
    ctx.strokeRect(x + .5, y + .5, w, h);
  }

  // draw mouse
  ctx.fillStyle = '#0007';
  ctx.fillRect(crt.mouse.x - 2, crt.mouse.y - 2, 5, 5);
  ctx.fillStyle = '#fff';
  ctx.fillRect(crt.mouse.x, crt.mouse.y, 1, 1);

  // draw char selection
  let x = 40 * 4, y = 25 * 4;
  // ctx.fillStyle = '#ff07';
  // ctx.fillRect(x - 1, y - 2, 6, 6);
  ctx.strokeStyle = '#ff03';
  ctx.strokeRect(x - .5, y - 1.5, 5, 5);

};

canvas.onmousedown = () => {
  drag = { x: crt.mouse.x, y: crt.mouse.y };
};

canvas.onmouseup = () => {
  drag = null;
};
