import { COLORS, ctx } from "./crt.js";

const mapping = `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_`;
const src = `
 xxx     xx      xxx     xx      xxx     xxx     xxx     x x     xxx     xxx     x x     x       xxx     xxx     xxx     xxx  |
 x x     xxx     x       x x     xx      xx      x       xxx      x       x      xx      x       xxx     x x     x x     x x  |
 xxx     x x     x       x x     x       x       x x     x x      x       x      xx      x       x x     x x     x x     xx   |
 x x     xxx     xxx     xx      xxx     x       xxx     x x     xxx     xx      x x     xxx     x x     x x     xxx     x    |
                                                                                                                              |
 xxx     xxx     xxx     xxx     x x     x x     x x     x x     x x     xxx                             xx       x      xxx  |
 x x     x x     x        x      x x     x x     x x      x      x x      xx                              x       x      x x  |
 xxx     xx       xx      x      x x     x x     xxx      x       x      x                        x                           |
   x     x x     xxx      x      xxx      x      xxx     x x      x      xxx              x      xx               x        x  |
                                                                                                                              |
 xx      xx      xxx     x x     xxx     xxx     xxx     xxx     xxx      x               x        x       x      x      x x  |
  x        x      xx     x x     xx      x         x     xxx     x x     x x     xxx     xxx      x       x        x     x x  |
  x       x        x     xxx       x     xxx       x     x x      xx     x x              x       x       x        x          |
 xxx     xxx     xxx       x     xx      xxx       x     xxx     xx       x                      x         x      x           |
                                                                                                                              |
 x        x       x      x x     xx      xx      xx       x      x                                                            |
                          x              x        x      x        x                                                           |
 x        x      xxx     x x     xx      x        x       x      x                                                            |
         x        x                      xx      xx                      xxx                                                  |`;

const chars: Record<string, boolean[][]> = {};

for (let i = 0; i < mapping.length; i++) {
  const c = mapping[i];

  const grid: boolean[][] = [];
  chars[c] = grid;

  for (let y = 0; y < 4; y++) {
    const row: boolean[] = [];
    grid.push(row);

    for (let x = 0; x < 4; x++) {
      const px = (i % 16) * 8 + 1 + x;
      const py = (Math.floor(i / 16) * 5) + y;
      const index = 1 + (px + py * 16 * 8);

      row.push(src[index] === ' ' ? false : true);
    }
  }
}

export function print(x: number, y: number, text: string, col = 7) {
  ctx.fillStyle = COLORS[col];

  text = text.toLowerCase();

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const map = chars[ch];

    for (let yy = 0; yy < 4; yy++) {
      for (let xx = 0; xx < 4; xx++) {
        const px = x + (i * 4) + xx;
        const py = y + yy;

        if (map[yy][xx]) {
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
}
