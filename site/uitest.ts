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
    if (this.rect.containsPoint(p)) return this;
    return null;
  }

}

class Root extends UIElement {

  showMouse = true;

  constructor() {
    super(Rect.from(0, 0, 320, 180));
  }

  override tick(delta: number): void {
    super.tick(delta);
    if (this.showMouse) mouse.fill('#00f');
  }

}

class Point {

  constructor(
    public x: number,
    public y: number,
  ) { }

  fill(c: string) {
    context.fillStyle = c;
    context.fillRect(this.x, this.y, 1, 1);
  }

  diff(other: Point) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  copy() {
    return new Point(this.x, this.y);
  }

  add(other: Point) {
    this.x += other.x;
    this.y += other.y;
  }

}

class Rect {

  static from(x: number, y: number, w: number, h: number) {
    return new Rect(new Point(x, y), w, h);
  }

  constructor(
    public p: Point,
    public w: number,
    public h: number,
  ) { }

  stroke(c: string) {
    context.strokeStyle = c;
    context.strokeRect(this.p.x + 0.5, this.p.y + 0.5, this.w - 1, this.h - 1);
  }

  fill(c: string) {
    context.fillStyle = c;
    context.fillRect(this.p.x, this.p.y, this.w, this.h);
  }

  containsPoint(p: Point) {
    return (
      p.x >= this.p.x &&
      p.y >= this.p.y &&
      p.x < this.p.x + this.w &&
      p.y < this.p.y + this.h);
  }

  moveBy(p: Point) {
    this.p.add(p);
  }

}

const mouse = new Point(0, 0);
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
  mouse.x = Math.round(e.offsetX / SCALE);
  mouse.y = Math.round(e.offsetY / SCALE);
  root.findElementAt(mouse)?.onMouseDown();
};

canvas.onmouseup = (e) => {
  root.findElementAt(mouse)?.onMouseUp();
};

canvas.onmousemove = (e) => {
  mouse.x = Math.round(e.offsetX / SCALE);
  mouse.y = Math.round(e.offsetY / SCALE);
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
    this.rect.stroke(this.over ? '#f00' : '#0f0');
  }

  onMouseDown(): void {
    this.dragStart = mouse.copy();
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

      this.dragOffset = mouse.diff(this.dragStart);
    }
  }

  onMouseUp(): void {
    if (this.dragOffset) {
      this.rect.moveBy(this.dragOffset);
    }

    this.dragStart = null;
    this.dragOffset = null;
  }

}

const b = new Button(Rect.from(10, 10, 20, 20));
root.children.push(b);
