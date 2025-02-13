const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;





const camera = { x: 0, y: 0 };

export class Box {

  children: Box[] = [];
  passthrough = false;
  hovered = false;
  mouse = { x: 0, y: 0 };

  constructor(
    public x = 0,
    public y = 0,
    public w = 0,
    public h = 0,
    public background?: string,
  ) { }

  draw() {
    this.drawBackground();
    this.drawChildren();
  }

  drawBackground() {
    if (!this.background) return;
    rectfill(0, 0, this.w, this.h, this.background);
  }

  drawChildren() {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      camera.x += child.x;
      camera.y += child.y;
      child.draw();
      camera.x -= child.x;
      camera.y -= child.y;
    }
  }

  onMouseDown() { }

}




new ResizeObserver(() => {
  const box = document.body.getBoundingClientRect();
  let w = 320;
  let h = 180;
  let s = 1;
  while (
    (w += 320) <= box.width &&
    (h += 180) <= box.height
  ) s++;
  canvas.style.transform = `scale(${s})`;
}).observe(document.body);







export const keys: Record<string, boolean> = {};

canvas.addEventListener('keydown', (e) => {
  keys[e.key] = true;
}, { passive: true });

canvas.addEventListener('keyup', (e) => {
  keys[e.key] = false;
}, { passive: true });










export const root = new Box(0, 0, 320, 180);

export const mouse = {
  x: 0,
  y: 0,
  button: 0,
};

let lastHovered: Box = root;

canvas.addEventListener('mousedown', (e) => {
  mouse.button = e.button;
  lastHovered.onMouseDown();
}, { passive: true });

canvas.addEventListener('mousemove', (e) => {
  const x = Math.floor(e.offsetX);
  const y = Math.floor(e.offsetY);

  if (x === mouse.x && y === mouse.y) return;
  if (x >= 320 || y >= 180) return;

  mouse.x = x;
  mouse.y = y;

  const hoveredOver = findElementAt(root, mouse.x, mouse.y)!;

  if (lastHovered !== hoveredOver) {
    lastHovered.hovered = false;
    hoveredOver.hovered = true;
    lastHovered = hoveredOver;
  }
}, { passive: true });

canvas.oncontextmenu = (e) => { e.preventDefault(); };






let tick = (delta: number) => { };
let last = +document.timeline.currentTime!;

function update(t: number) {
  if (t - last >= 30) {
    tick(t - last);
    root.draw();
    last = t;
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

export function ontick(fn: (delta: number) => void) {
  tick = fn;
}







function findElementAt(box: Box, x: number, y: number): Box | null {
  const inThis = (x >= 0 && y >= 0 && x < box.w && y < box.h);
  if (!inThis) return null;

  box.mouse.x = x;
  box.mouse.y = y;

  let i = box.children.length;
  while (i--) {
    const child = box.children[i];
    if (child.passthrough) continue;

    const found = findElementAt(child, x - child.x, y - child.y);
    if (found) return found;
  }

  return box;
}




export function pset(x: number, y: number, c: string) {
  rectfill(x, y, 1, 1, c);
}

export function drawrect(x: number, y: number, w: number, h: number, c: string) {
  context.strokeStyle = c;
  context.strokeRect(
    x + 0.5 + camera.x,
    y + 0.5 + camera.y,
    w - 1,
    h - 1);
}

export function rectfill(x: number, y: number, w: number, h: number, c: string) {
  context.fillStyle = c;
  context.fillRect(
    x + camera.x,
    y + camera.y,
    w,
    h);
}














class Dragger {

  startMouse;
  startElPos;

  constructor(private el: Box) {
    this.startMouse = { x: mouse.x, y: mouse.y };
    this.startElPos = { x: el.x, y: el.y };
  }

  update() {
    const offx = this.startMouse.x - this.startElPos.x;
    const offy = this.startMouse.y - this.startElPos.y;
    const diffx = mouse.x - this.startElPos.x;
    const diffy = mouse.y - this.startElPos.y;
    this.el.x = this.startElPos.x + diffx - offx;
    this.el.y = this.startElPos.y + diffy - offy;
  }

}

export class DragHandle extends Box {

  #dragger: Dragger | null = null;

  constructor(public moves: Box, ...args: ConstructorParameters<typeof Box>) {
    super(...args);
  }

  onMouseDown(): void {
    this.#dragger = new Dragger(this.moves);

    const cancel = new AbortController();

    canvas.addEventListener('mousemove', () => {
      this.#dragger?.update();
    }, { signal: cancel.signal });

    canvas.addEventListener('mouseup', () => {
      cancel.abort();
      this.#dragger = null;
    }, { once: true });
  }

}

export class Button extends Box {

  clicking = false;
  onClick() { }

  onMouseDown(): void {
    const cancel = new AbortController();
    this.clicking = true;

    canvas.addEventListener('mouseup', () => {
      cancel.abort();
      this.onClick();
      this.clicking = false;
    }, { signal: cancel.signal, once: true });

    canvas.addEventListener('mousemove', () => {
      console.log('hey', this.hovered);
      if (!this.hovered) {
        cancel.abort();
        this.clicking = false;
      }
    }, { signal: cancel.signal });

  }

}










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

export function print(x: number, y: number, c: string, text: string) {
  let posx = 0;
  let posy = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '\n') {
      posy++;
      posx = 0;
      continue;
    }

    const map = chars[ch];

    for (let yy = 0; yy < 4; yy++) {
      for (let xx = 0; xx < 4; xx++) {
        const px = x + (posx * 4) + xx;
        const py = y + (posy * 6) + yy;

        if (map[yy][xx]) {
          pset(px, py, c);
        }
      }
    }

    posx++;
  }
}
