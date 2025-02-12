const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;

canvas.oncontextmenu = (e) => { e.preventDefault(); };

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

  onMouseDown() { }
  onMouseMove() { }
  onMouseUp() { }
  onMouseExit() { }
  onMouseEnter() { }

  findElementAt(p: Point): UIElement | null {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const found = child.findElementAt(p);
      if (found) return found;
    }
    if (rectContainsPoint(this.rect, p)) return this;
    return null;
  }

}

class Root extends UIElement {

  showMouse = true;

  constructor() {
    super({ x: 0, y: 0, w: 320, h: 180 });
  }

  override tick(delta: number): void {
    super.tick(delta);
    if (this.showMouse) fillPoint(mouse, '#00f');
  }

}




interface Point {
  x: number;
  y: number;
}

function fillPoint(p: Point, c: string) {
  context.fillStyle = c;
  context.fillRect(p.x, p.y, 1, 1);
}

function diffPoint(p: Point, other: Point) {
  return { x: p.x - other.x, y: p.y - other.y };
}



interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function strokeRect(r: Rect, c: string) {
  context.strokeStyle = c;
  context.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
}

function fillRect(r: Rect, c: string) {
  context.fillStyle = c;
  context.fillRect(r.x, r.y, r.w, r.h);
}

function rectContainsPoint(r: Rect, p: Point) {
  return (
    p.x >= r.x &&
    p.y >= r.y &&
    p.x < r.x + r.w &&
    p.y < r.y + r.h);
}



const mouse = { x: 0, y: 0 };
const root = new Root();

let last = +document.timeline.currentTime!;
function update(t: number) {
  if (t - last >= 30) {
    context.clearRect(0, 0, 320, 180);
    const delta = t - last;
    last = t;
    root.tick(delta);
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

let lastElement: UIElement | null = null;

canvas.onmousedown = (e) => {
  mouse.x = Math.floor(e.offsetX / SCALE);
  mouse.y = Math.floor(e.offsetY / SCALE);
  root.findElementAt(mouse)?.onMouseDown();
};

canvas.onmouseup = (e) => {
  root.findElementAt(mouse)?.onMouseUp();
};

canvas.onmousemove = (e) => {
  mouse.x = Math.floor(e.offsetX / SCALE);
  mouse.y = Math.floor(e.offsetY / SCALE);
  const current = root.findElementAt(mouse);

  if (lastElement !== current) {
    lastElement?.onMouseExit();
    current?.onMouseEnter();
    lastElement = current;
  }

  current?.onMouseMove();
};





class Button extends UIElement {

  dragStart: Point | null = null;
  dragOffset: Point | null = null;

  over = false;

  tick(delta: number): void {
    strokeRect(this.rect, this.over ? '#f00' : '#0f0');
  }

  onMouseDown(): void {
    this.dragStart = { ...mouse };
  }

  onMouseEnter(): void {
    this.over = true;
    root.showMouse = false;
  }

  onMouseExit(): void {
    this.over = false;
    root.showMouse = true;
  }

  onMouseMove(): void {
    if (this.dragStart) {

      if (this.dragOffset) {
        // this.rect.moveBy()
      }

      this.dragOffset = diffPoint(mouse, this.dragStart);
    }
  }

  onMouseUp(): void {
    if (this.dragOffset) {
      this.rect.x += this.dragOffset.x;
      this.rect.y += this.dragOffset.y;
    }

    this.dragStart = null;
    this.dragOffset = null;
  }

}

const b = new Button({ x: 10, y: 10, w: 20, h: 20 });
root.children.push(b);
