const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;





export class Box {

  children: Box[] = [];

  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    public background?: string,
  ) { }

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

  findElementAt(p: Point): Box | null {
    p.x -= this.x;
    p.y -= this.y;
    for (let i = 0; i < this.children.length; i++) {
      const found = this.children[i].findElementAt(p);
      if (found) return found;
    }
    p.x += this.x;
    p.y += this.y;
    if (rectContainsPoint(this, p)) return this;
    return null;
  }

}





export const camera: Point = { x: 0, y: 0 };

export const root = new Box(0, 0, 320, 180);

export const keys: Record<string, boolean> = {};

export const mouse = {
  x: 0,
  y: 0,
  button: 0,
};




new ResizeObserver(() => {
  const box = document.body.getBoundingClientRect();
  let width = 320;
  let height = 180;
  let scale = 1;
  while ((width += 320) <= box.width && (height += 180) <= box.height) scale++;
  canvas.style.transform = `scale(${scale})`;
}).observe(document.body);

canvas.onkeydown = (e) => {
  keys[e.key] = true;
};

canvas.onkeyup = (e) => {
  keys[e.key] = false;
};

canvas.onmousedown = (e) => {
  mouse.button = e.button;
  mouse.x = Math.floor(e.offsetX);
  mouse.y = Math.floor(e.offsetY);
  root.findElementAt({ ...mouse })?.onMouseDown();
};

canvas.onmouseup = (e) => {
  root.findElementAt({ ...mouse })?.onMouseUp();
};

let lastHovered: Box | null = null;

canvas.onmousemove = (e) => {
  mouse.x = Math.floor(e.offsetX);
  mouse.y = Math.floor(e.offsetY);
  const hoveredOver = root.findElementAt({ ...mouse });

  if (lastHovered !== hoveredOver) {
    lastHovered?.onMouseExit();
    hoveredOver?.onMouseEnter();
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






export function pset(p: Point, c: string) {
  rectfill(p.x, p.y, 1, 1, c);
}

export function drawrect(x: number, y: number, w: number, h: number, c: string) {
  context.strokeStyle = c;
  context.strokeRect(x + 0.5 + camera.x, y + 0.5 + camera.y, w - 1, h - 1);
}

export function rectfill(x: number, y: number, w: number, h: number, c: string) {
  context.fillStyle = c;
  context.fillRect(x + camera.x, y + camera.y, w, h);
}


export function rectContainsPoint(r: Rect, p: Point) {
  return (
    p.x >= r.x &&
    p.y >= r.y &&
    p.x < r.x + r.w &&
    p.y < r.y + r.h);
}




export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}










export class Dragger {

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
