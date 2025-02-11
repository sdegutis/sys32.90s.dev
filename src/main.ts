import { COLORS, ctx, openCRT } from "./crt";
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

const crt = openCRT();

const noise1 = createNoise2D(alea(7 + 0));
const noise2 = createNoise2D(alea(7 + 1));
const noise3 = createNoise2D(alea(7 + 2));

const tiles: number[][] = [];
for (let y = 0; y < 180; y++) {
  const row: number[] = [];
  tiles.push(row);
  for (let x = 0; x < 320; x++) {
    const n1 = noise1(x / 30, y / 30) + 1;
    const n2 = noise2(x / 50, y / 50) + 1;
    const n3 = noise3(x / 90, y / 90) + 1;
    const n = (n1 + n2 + n3) / 3;

    let c = 1;
    if (n > 0.50) c = 12;
    if (n > 0.70) c = 5;
    if (n > 0.90) c = 3;
    if (n > 1.25) c = 5;
    if (n > 1.50) c = 6;

    row.push(c);
  }
}

crt.update = (t: number) => {
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      ctx.fillStyle = COLORS[tiles[y][x]];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // draw mouse

  ctx.fillStyle = COLORS[7];
  ctx.strokeStyle = COLORS[12];

  ctx.fillRect(crt.mouse.x, crt.mouse.y, 1, 1);

  // ctx.strokeRect(crt.mouse.x - .5, crt.mouse.y - .5, 2, 2);
  ctx.beginPath();
  ctx.arc(crt.mouse.x + 0.5, crt.mouse.y + 0.5, 3, 0, Math.PI * 2);
  ctx.stroke();

};
