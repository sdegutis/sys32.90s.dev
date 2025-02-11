import { COLORS, ctx, openCRT } from "./crt";
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

const crt = openCRT();

const prng = alea('seed');
const noise2D = createNoise2D(prng);

crt.update = (t: number) => {

  ctx.fillStyle = COLORS[2];
  ctx.fillRect(0, 0, 320, 180);

  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      const n = noise2D(x, y);

      ctx.fillStyle = COLORS[n > 0.5 ? 3 : 2];
      ctx.fillRect(x, y, 1, 1);
    }
  }




  // ctx.fillStyle = COLORS[3];
  // ctx.fillRect(1, 1, 3, 3);



  // draw mouse

  ctx.fillStyle = COLORS[7];
  ctx.strokeStyle = COLORS[12];

  ctx.fillRect(crt.mouse.x, crt.mouse.y, 1, 1);

  // ctx.strokeRect(crt.mouse.x - .5, crt.mouse.y - .5, 2, 2);
  ctx.beginPath();
  ctx.arc(crt.mouse.x + 0.5, crt.mouse.y + 0.5, 3, 0, Math.PI * 2);
  ctx.stroke();

};
