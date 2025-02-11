import { canvas, COLORS, ctx, openCRT } from "./crt.js";
import { print } from "./font.js";

type Tile = {
  type: 'grass' | 'tree' | 'farmer' | 'gold' | 'rock',
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

let left = false;
let hand = false;

function pset(c: number, x: number, y: number) {
  ctx.fillStyle = COLORS[c];
  ctx.fillRect(x, y, 1, 1);
}

const draw: { [K in Tile['type']]: (x: number, y: number) => void } = {
  grass: (x, y) => {
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(x, y, 4, 4);
  },
  gold: (x, y) => {
    draw.grass(x, y);
    pset(6, x + 2, y + 1);
    pset(6, x + 1, y + 2);
    pset(6, x + 1, y + 3);
    pset(5, x + 3, y + 2);
    pset(5, x + 3, y + 3);
    pset(hp > 2 ? 10 : 1, x + 2, y + 2);
    pset(hp > 2 ? 10 : 1, x + 2, y + 3);
  },
  rock: (x, y) => {
    draw.grass(x, y);
    pset(6, x + 2, y + 1);
    pset(6, x + 3, y + 1);
    pset(6, x + 1, y + 2);
    pset(6, x + 2, y + 2);
    pset(6, x + 1, y + 3);
    pset(5, x + 2, y + 3);
    pset(5, x + 3, y + 3);
    pset(5, x + 3, y + 2);
  },
  tree: (x, y) => {
    draw.grass(x, y);
    pset(11, x + 1, y + 1);
    pset(11, x, y + 2);
    pset(11, x + 1, y + 2);
    pset(11, x + 2, y + 2);
    pset(5, x + 1, y + 3);
  },
  farmer: (x, y) => {
    draw.grass(x, y);

    let xx = 0;
    if (left) xx = 1;

    pset(15, xx + x + 1, y);
    pset(2, xx + x + 1, y + 1);
    pset(1, xx + x + 1, y + 2);

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

let drag: { x: number, y: number, b: number } | null = null;

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

let hp = 1;
let changerhp = 0;

const crt = openCRT();
crt.update = (t: number, delta: number) => {

  changerhp += delta;
  if (changerhp > 500) {
    changerhp = 0;
    hp++;
    if (hp > 4) hp = 0;
  }

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
      if (x + y < 33) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x * 4, y * 4, 4, 4);
      }
      else if (x + y < 35) {
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

  let x = 40 * 4, y = 25 * 4;

  // draw char selection
  if (drag) {
    // ctx.fillStyle = '#ff07';
    // ctx.fillRect(x - 1, y - 2, 6, 6);
    ctx.strokeStyle = '#ff03';
    ctx.strokeRect(x - .5, y - 1.5, 5, 5);
  }

  // draw hp bar
  const hp___red = hp < 3 ? 'f' : '0';
  const hp_green = hp > 1 ? 'f' : '0';
  ctx.strokeStyle = `#${hp___red}${hp_green}0`;
  ctx.strokeRect(x, y - 1.5, hp, 0);

  const text = "gold:350  lumber:400";
  ctx.fillStyle = '#0007';
  ctx.fillRect(crt.mouse.x - 2, crt.mouse.y + 2, text.length * 4 + 3, 8);
  print(crt.mouse.x, crt.mouse.y + 4, text, 10);
};

canvas.onmousedown = (e) => {
  drag = { x: crt.mouse.x, y: crt.mouse.y, b: e.button };
};

canvas.onmouseup = (e) => {
  const dx = Math.abs(crt.mouse.x - drag!.x);
  const dy = Math.abs(crt.mouse.y - drag!.y);
  const isClick = dx < 2 && dy < 2;

  if (isClick) {
    console.log('click', e.button);
  }
  else {
    console.log('dragend', drag!.b)
  }

  drag = null;
};
