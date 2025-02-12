const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;

class Box {

  children: Box[] = [];

  constructor(
    public rect: Rect,
  ) { }

  tick(delta: number) {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].tick(delta);
    }
  }

  draw() {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      camera.x += child.rect.x;
      camera.y += child.rect.y;
      child.draw();
      camera.x -= child.rect.x;
      camera.y -= child.rect.y;
    }
  }

  onMouseDown() { }
  onMouseUp() { }
  onMouseExit() { }
  onMouseEnter() { }

  findElementAt(p: Point): Box | null {
    p.x -= this.rect.x;
    p.y -= this.rect.y;
    for (let i = 0; i < this.children.length; i++) {
      const found = this.children[i].findElementAt(p);
      if (found) return found;
    }
    p.x += this.rect.x;
    p.y += this.rect.y;
    if (rectContainsPoint(this.rect, p)) return this;
    return null;
  }

}

const root = new Box({ x: 0, y: 0, w: 320, h: 180 });

const camera: Point = { x: 0, y: 0 };

const keys: Record<string, boolean> = {};

const mouse = {
  point: { x: 0, y: 0 },
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

let onMouseMove: (() => void) | null = null;

canvas.onmousedown = (e) => {
  mouse.button = e.button;
  mouse.point.x = Math.floor(e.offsetX);
  mouse.point.y = Math.floor(e.offsetY);
  root.findElementAt({ ...mouse.point })?.onMouseDown();
};

canvas.onmouseup = (e) => {
  onMouseMove = null;
  root.findElementAt({ ...mouse.point })?.onMouseUp();
};

let lastHovered: Box | null = null;

canvas.onmousemove = (e) => {
  mouse.point.x = Math.floor(e.offsetX);
  mouse.point.y = Math.floor(e.offsetY);
  const hoveredOver = root.findElementAt({ ...mouse.point });

  if (lastHovered !== hoveredOver) {
    lastHovered?.onMouseExit();
    hoveredOver?.onMouseEnter();
    lastHovered = hoveredOver;
  }

  onMouseMove?.();
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

















class Dragger {

  startMouse;
  startElPos;

  constructor(private el: Box) {
    onMouseMove = () => this.update();
    this.startMouse = { ...mouse.point };
    this.startElPos = { ...el.rect };
  }

  update() {
    const offx = this.startMouse.x - this.startElPos.x;
    const offy = this.startMouse.y - this.startElPos.y;
    const diffx = mouse.point.x - this.startElPos.x;
    const diffy = mouse.point.y - this.startElPos.y;
    this.el.rect.x = this.startElPos.x + diffx - offx;
    this.el.rect.y = this.startElPos.y + diffy - offy;
  }

}

class Box2 extends Box {

  dragger: Dragger | null = null;

  col = '#ff0';

  draw(): void {
    rectfill(0, 0, this.rect.w, this.rect.h, this.col);
    super.draw();
  }

  onMouseDown(): void {
    this.dragger = new Dragger(this)
  }

  onMouseUp(): void {
    this.dragger = null;
  }

}

class Button extends Box {

  dragger: Dragger | null = null;
  inside = false;
  clicking = false;

  draw(): void {
    super.draw();

    let col = '#00f';
    if (button.inside) col = '#0f0';
    if (button.dragger) col = '#f00';
    if (button.clicking) col = '#fff';

    drawrect(0, 0, button.rect.w, button.rect.h, col);
    pset({ x: 0, y: 0 }, '#fff');
  }

  onMouseEnter(): void {
    this.inside = true;
  }

  onMouseExit(): void {
    this.inside = false;
    this.clicking = false;
  }

  onMouseDown(): void {
    if (keys[' ']) this.dragger = new Dragger(this)
    else this.clicking = true;
  }

  onMouseUp(): void {
    if (this.clicking) {
      this.onClick();
    }
    this.clicking = false;
    this.dragger = null;
  }

  onClick() { }

}

const box1 = new Box2({ x: 10, y: 10, w: 20, h: 20 });
box1.col = '#ff03';
root.children.push(box1);

const box2 = new Box2({ x: 1, y: 1, w: 10, h: 10 });
box2.col = '#0ff3';
box1.children.push(box2);

const button = new Button({ x: 0, y: 0, w: 5, h: 5 });
box2.children.push(button);

button.onClick = () => {
  console.log('clicked');
};


const cursor = new Box({ x: 0, y: 0, w: 320, h: 180 });
cursor.draw = () => pset(mouse.point, '#00f');
root.children.push(cursor);





function pset(p: Point, c: string) {
  rectfill(p.x, p.y, 1, 1, c);
}

function drawrect(x: number, y: number, w: number, h: number, c: string) {
  context.strokeStyle = c;
  context.strokeRect(x + 0.5 + camera.x, y + 0.5 + camera.y, w - 1, h - 1);
}

function rectfill(x: number, y: number, w: number, h: number, c: string) {
  context.fillStyle = c;
  context.fillRect(x + camera.x, y + camera.y, w, h);
}


function rectContainsPoint(r: Rect, p: Point) {
  return (
    p.x >= r.x &&
    p.y >= r.y &&
    p.x < r.x + r.w &&
    p.y < r.y + r.h);
}








interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
