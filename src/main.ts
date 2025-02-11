import { canvas, COLORS, ctx, openCRT } from "./crt";

type Tile = {
  type: 'grass' | 'tree' | 'farmer' | 'gold' | 'rock',
  x: number,
  y: number,
  age: number,
};

const drawings = {
  tree: '[gfx]0808000000000b000000bbb000000500000000000000000000000000000000000000[/gfx]',
  rock: '[gfx]08080000000000660000066500000655000000000000000000000000000000000000[/gfx]',
  lawn: '[gfx]08083333000033330000333300003333000000000000000000000000000000000000[/gfx]',
  gold: '[gfx]08080000000000600000061500000615000000000000000000000000000000000000[/gfx]',
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

let left = false;
let hand = false;

function drawSprite(x: number, y: number, spr: string) {
  for (let yy = 0; yy < 4; yy++) {
    for (let xx = 0; xx < 4; xx++) {
      const i = 9 + (yy * 8) + xx;
      const c = parseInt(spr[i], 16);
      if (c > 0) {
        ctx.fillStyle = COLORS[c];
        ctx.fillRect(x + xx, y + yy, 1, 1);
      }
    }
  }
}

const draw: { [K in Tile['type']]: (x: number, y: number) => void } = {
  grass: (x, y) => {
    // ctx.fillStyle = COLORS[3];
    // ctx.fillRect(x, y, 4, 4);
    drawSprite(x, y, drawings.lawn);
  },
  gold: (x, y) => {
    draw.grass(x, y);
    drawSprite(x, y, drawings.gold);
  },
  rock: (x, y) => {
    draw.grass(x, y);
    drawSprite(x, y, drawings.rock);
  },
  tree: (x, y) => {
    draw.grass(x, y);
    drawSprite(x, y, drawings.tree);

    // ctx.fillStyle = COLORS[11];
    // ctx.fillRect(x + 1, y + 1, 1, 1);
    // ctx.fillRect(x, y + 2, 1, 1);
    // ctx.fillRect(x + 1, y + 2, 1, 1);
    // ctx.fillRect(x + 2, y + 2, 1, 1);
    // ctx.fillStyle = COLORS[5];
    // ctx.fillRect(x + 1, y + 3, 1, 1);
  },
  farmer: (x, y) => {
    draw.grass(x, y);

    let xx = 0;
    if (left) xx = 1;

    ctx.fillStyle = COLORS[15];
    ctx.fillRect(xx + x + 1, y, 1, 1);
    ctx.fillStyle = COLORS[2];
    ctx.fillRect(xx + x + 1, y + 1, 1, 1);
    ctx.fillStyle = COLORS[1];
    ctx.fillRect(xx + x + 1, y + 2, 1, 1);

    if (hand) {
      ctx.fillStyle = COLORS[2];
      ctx.fillRect(x + 2 - xx, y + 1, 1, 1);
    }
  },
};

for (let y = 10; y < 20; y++) {
  for (let x = 20; x < 30; x++) {
    tiles[y][x].type = 'tree';
  }
}

tiles[25][40].type = 'farmer';
tiles[31][40].type = 'gold';
tiles[30][42].type = 'rock';
tiles[31][42].type = 'rock';
tiles[31][43].type = 'rock';

let drag: { x: number, y: number } | null = null;

function maybeNewTree(x: number, y: number) {
  if (x < 0 || y < 0 || x >= 80 || y >= 45) return;
  const nei = tiles[y][x];
  if (nei.type === 'grass') {
    if (Math.random() > 0.999) {
      nei.type = 'tree';
      nei.age = 0;
    }
  }
}

let changer1 = 0;
let changer2 = 0;

const crt = openCRT();
crt.update = (t: number, delta: number) => {

  changer1 += delta;
  if (changer1 > 1000) {
    changer1 = 0;
    left = !left;
  }

  changer2 += delta;
  if (changer2 > 800) {
    changer2 = 0;
    hand = !hand;
  }

  // maybe grow trees
  for (let y = 0; y < 45; y++) {
    for (let x = 0; x < 80; x++) {
      const tile = tiles[y][x];
      if (tile.type === 'tree') {
        if (tile.age > 1000) {
          tile.age = 0;
          maybeNewTree(x + 1, y);
          maybeNewTree(x - 1, y);
          maybeNewTree(x, y + 1);
          maybeNewTree(x, y - 1);
        }
        tile.age += delta;
      }
    }
  }

  // draw each tile
  for (let y = 0; y < 45; y++) {
    for (let x = 0; x < 80; x++) {
      const fn = draw[tiles[y][x].type];
      fn(x * 4, y * 4);

      // experiment with fog
      if (y <= 11) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x * 4, y * 4, 4, 4);
      }
      else if (y <= 15) {
        ctx.fillStyle = '#000b';
        ctx.fillRect(x * 4, y * 4, 4, 4);
      }
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
  // ctx.fillRect(crt.mouse.x - 2, crt.mouse.y - 2, 5, 5);
  ctx.fillRect(crt.mouse.x - 2, crt.mouse.y, 5, 1);
  ctx.fillRect(crt.mouse.x, crt.mouse.y - 2, 1, 5);
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
