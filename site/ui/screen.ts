const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;





export class Box {

  name: string;
  x = 0;
  y = 0;
  w = 0;
  h = 0;
  background?: string;
  children: Box[] = [];
  passthrough = false;
  hovered = false;

  constructor(name: string) {
    this.name = name;
  }

  build(
    x: number,
    y: number,
    w: number,
    h: number,
    background?: string,
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.background = background;
    return this;
  }

  tick(delta: number) {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].tick(delta);
    }
  }

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
  onMouseUp() { }
  onMouseExit() { }
  onMouseEnter() { }

}





export const camera = { x: 0, y: 0 };

export const root = new Box('root').build(0, 0, 320, 180);

export const keys: Record<string, boolean> = {};

export const mouse = {
  x: 0,
  y: 0,
  button: 0,
};




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

canvas.onkeydown = (e) => {
  keys[e.key] = true;
};

canvas.onkeyup = (e) => {
  keys[e.key] = false;
};

let lastHovered: Box = root;

canvas.onmousedown = (e) => {
  mouse.button = e.button;
  mouse.x = Math.floor(e.offsetX);
  mouse.y = Math.floor(e.offsetY);
  lastHovered?.onMouseDown();
};

canvas.onmouseup = (e) => {
  lastHovered?.onMouseUp();
};

canvas.onmousemove = (e) => {
  mouse.x = Math.floor(e.offsetX);
  mouse.y = Math.floor(e.offsetY);
  console.log('')
  console.log('starting check')
  const hoveredOver = findElementAt(root, mouse.x, mouse.y)!;
  console.log('found:', hoveredOver.name)

  if (lastHovered !== hoveredOver) {
    lastHovered.hovered = false;
    hoveredOver.hovered = true;
    lastHovered.onMouseExit();
    hoveredOver.onMouseEnter();
    lastHovered = hoveredOver;
  }
};

canvas.oncontextmenu = (e) => { e.preventDefault(); };

let last = +document.timeline.currentTime!;
function update(t: number) {
  if (t - last >= 30) {
    context.clearRect(0, 0, 320, 180);
    const delta = t - last;
    last = t;
    root.tick(delta);
    root.draw();
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);






function findElementAt(box: Box, x: number, y: number): Box | null {

  console.log(x, y, box.name)

  if (box.passthrough) return null;

  const inThis = (
    x >= box.x &&
    y >= box.y &&
    x < box.x + box.w &&
    y < box.y + box.h);

  if (!inThis) return null;

  let i = box.children.length;
  while (i--) {
    // for (let i = 0; i < this.children.length; i++) {
    const child = box.children[i];
    const found = findElementAt(child, x - child.x, y - child.y);
    if (found) {
      // console.log(x, y, this.#children[i])
      return found;
    }
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

  dragger: Dragger | null = null;

  constructor(name: string, public moves: Box) {
    super(name);
  }

  tick(delta: number): void {
    super.tick(delta);
    this.dragger?.update();
  }

  onMouseDown(): void {
    this.dragger = new Dragger(this.moves)
  }

  onMouseUp(): void {
    this.dragger = null;
  }

}

export class Button extends Box {
  clicking = false;
  onClick() { }
  onMouseDown(): void { this.clicking = true; }
  onMouseExit(): void { this.clicking = false; }
  onMouseUp(): void {
    if (this.clicking) this.onClick();
    this.clicking = false;
  }
}
