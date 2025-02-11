export const canvas = document.querySelector('canvas')!;
export const ctx = canvas.getContext('2d')!;

canvas.oncontextmenu = (e) => { e.preventDefault(); };

export const callbacks = {
  ontick: (delta: number) => { },
  onclick: () => { },
  ondragend: () => { },
};

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

export const mouse = {
  x: 0,
  y: 0,
  button: 0,
  drag: null as { x: number, y: number, b: number } | null,
};

canvas.onmousemove = (e) => {
  mouse.x = Math.round((e.offsetX - SCALE / 2) / SCALE);
  mouse.y = Math.round((e.offsetY - SCALE / 2) / SCALE);
};

canvas.onmousedown = (e) => {
  mouse.drag = { x: mouse.x, y: mouse.y, b: e.button };
};

canvas.onmouseup = (e) => {
  const dx = Math.abs(mouse.x - mouse.drag!.x);
  const dy = Math.abs(mouse.y - mouse.drag!.y);
  const isClick = dx < 2 && dy < 2;

  if (isClick) {
    mouse.button = e.button;
    callbacks.onclick();
  }
  else {
    mouse.button = mouse.drag!.b;
    callbacks.ondragend();
  }

  mouse.drag = null;
};

let last = +document.timeline.currentTime!;
function update(t: number) {
  if (t - last >= 30) {
    callbacks.ontick(t - last);
    last = t;
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

export const COLORS = [
  '#000000', '#1D2B53', '#7E2553', '#008751',
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436',
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
];
