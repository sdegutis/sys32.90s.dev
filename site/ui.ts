const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;





export const camera = { x: 0, y: 0 };

export class Box {

  children: Box[] = [];
  passthrough = false;
  hovered = false;
  mouse = { x: 0, y: 0 };

  constructor(
    public name: string,
    public x = 0,
    public y = 0,
    public w = 0,
    public h = 0,
    public background?: string,
  ) { }

  draw() {
    if (this.background) {
      rectfill(0, 0, this.w, this.h, this.background);
    }

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
  onMouseExit() { }
  onMouseEnter() { }

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

canvas.onkeydown = (e) => {
  keys[e.key] = true;
};

canvas.onkeyup = (e) => {
  keys[e.key] = false;
};










export const root = new Box('root', 0, 0, 320, 180);

export const mouse = {
  x: 0,
  y: 0,
  button: 0,
};

let lastHovered: Box = root;

canvas.onmousedown = (e) => {
  mouse.button = e.button;
  lastHovered.onMouseDown();
};

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
    lastHovered.onMouseExit();
    hoveredOver.onMouseEnter();
    lastHovered = hoveredOver;
  }
}, { passive: true });

canvas.oncontextmenu = (e) => { e.preventDefault(); };

let last = +document.timeline.currentTime!;
function update(t: number) {
  if (t - last >= 30) {
    context.clearRect(0, 0, 320, 180);
    const delta = t - last;
    last = t;
    // allthings.tick(delta);
    root.draw();
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);






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

  #cancel: AbortController | undefined;

  onMouseDown(): void {
    this.#cancel = new AbortController();
    this.clicking = true;
    canvas.addEventListener('mouseup', () => {
      this.onClick();
      this.clicking = false;
    }, { signal: this.#cancel.signal, once: true });
  }

  onMouseExit(): void {
    this.#cancel?.abort();
    this.clicking = false;
  }

}
