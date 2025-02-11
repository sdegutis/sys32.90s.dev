export const canvas = document.querySelector('canvas')!;
export const ctx = canvas.getContext('2d')!;

export function openCRT() {
  let SCALE = 1;
  new ResizeObserver(() => {
    const box = document.body.getBoundingClientRect();
    let width = 320;
    let height = 180;
    SCALE = 1;
    while (width + 320 <= box.width && height + 180 <= box.height) {
      width += 320;
      height += 180;
      SCALE++;
    }
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }).observe(document.body);

  const mouse = { x: 0, y: 0 };
  canvas.onmousemove = (e) => {
    mouse.x = Math.round((e.offsetX - SCALE / 2) / SCALE);
    mouse.y = Math.round((e.offsetY - SCALE / 2) / SCALE);
  };

  const crt = {
    update: (time: number, delta: number) => { },
    mouse,
  };

  let from = +document.timeline.currentTime!;
  const step = () => {
    requestAnimationFrame(t => {
      if (t - from >= 30) {
        crt.update(t, t - from);
        from = t;
      }
      step();
    });
  };
  step();

  return crt;
}

export const COLORS = [
  '#000000', '#1D2B53', '#7E2553', '#008751',
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436',
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
];

export function pset(c: number, x: number, y: number) {
  ctx.fillStyle = COLORS[c];
  ctx.fillRect(x, y, 1, 1);
}
