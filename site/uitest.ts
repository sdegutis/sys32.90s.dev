const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;

canvas.oncontextmenu = (e) => { e.preventDefault(); };

new ResizeObserver(() => {
  const box = document.body.getBoundingClientRect();
  let width = 320;
  let height = 180;
  let scale = 1;
  while ((width += 320) <= box.width && (height += 180) <= box.height) scale++;
  canvas.style.transform = `scale(${scale})`;
}).observe(document.body);



export const keys: Record<string, boolean> = {};

canvas.onkeydown = (e) => {
  keys[e.key] = true;
};

canvas.onkeyup = (e) => {
  keys[e.key] = false;
};



class UIElement {

  children: UIElement[] = [];

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
      this.children[i].draw();
    }
  }

  drawStart() {
    camera.x += this.rect.x;
    camera.y += this.rect.y;
  }

  drawEnd() {
    camera.x -= this.rect.x;
    camera.y -= this.rect.y;
  }

  onMouseDown() { }
  onMouseUp() { }
  onMouseExit() { }
  onMouseEnter() { }

  findElementAt(p: Point): UIElement | null {
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

class Root extends UIElement {

  showMouse = true;

  constructor() {
    super({ x: 0, y: 0, w: 320, h: 180 });
  }

  draw(): void {
    super.draw();
    if (this.showMouse) pset(mouse.point, '#00f');
  }

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

const camera: Point = { x: 0, y: 0 };

function pset(p: Point, c: string) {
  rectfill(p.x, p.y, 1, 1, c);
}

function rectline(x: number, y: number, w: number, h: number, c: string) {
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



const mouse = {
  point: { x: 0, y: 0 },
  button: 0,
};

const root = new Root();

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

let lastHovered: UIElement | null = null;

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




class Dragger {

  startMouse;
  startElPos;

  constructor(private el: UIElement) {
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

class Box extends UIElement {

  dragger: Dragger | null = null;

  col = '#ff0';

  draw(): void {
    this.drawStart();

    rectfill(0, 0, this.rect.w, this.rect.h, this.col);
    super.draw();

    this.drawEnd();
  }

  onMouseDown(): void {
    this.dragger = new Dragger(this)
  }

  onMouseUp(): void {
    this.dragger = null;
  }

}

class Button extends UIElement {

  dragger: Dragger | null = null;
  inside = false;
  clicking = false;

  draw(): void {
    this.drawStart();

    super.draw();

    let col = '#00f';
    if (button.inside) col = '#0f0';
    if (button.dragger) col = '#f00';
    if (button.clicking) col = '#fff';

    rectline(0, 0, button.rect.w, button.rect.h, col);
    pset({ x: 0, y: 0 }, '#fff');

    this.drawEnd();
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

const box1 = new Box({ x: 10, y: 10, w: 20, h: 20 });
box1.col = '#ff0';
root.children.push(box1);

const box2 = new Box({ x: 1, y: 1, w: 10, h: 10 });
box2.col = '#0ff';
box1.children.push(box2);

const button = new Button({ x: 0, y: 0, w: 5, h: 5 });
box2.children.push(button);

button.onClick = () => {
  console.log('clicked');
};
