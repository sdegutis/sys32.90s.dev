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

  tick(delta: number) { }

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

class Game extends UIElement {

  mouse = new Point(0, 0);

  constructor() {
    super(Rect.from(0, 0, 320, 180));
  }

  override tick(delta: number): void {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].tick(delta);
    }

    this.mouse.fill('#00f');
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

}

class Button extends UIElement {

  tick(delta: number): void {
    this.rect.stroke('#f00');
  }

}

const game = new Game();



const b = new Button(Rect.from(10, 10, 20, 20));
game.children.push(b);


let last = +document.timeline.currentTime!;
function update(t: number) {
  if (t - last >= 30) {
    context.clearRect(0, 0, 320, 180);
    const delta = t - last;
    last = t;
    game.tick(delta);
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);





canvas.onmousedown = (e) => {
  game.mouse.x = Math.round(e.offsetX / SCALE);
  game.mouse.y = Math.round(e.offsetY / SCALE);

  console.log('onmousedown', game.mouse, game.findElementAt(game.mouse));
};

canvas.onmouseup = (e) => {
  console.log('onmouseup');
};

canvas.onmousemove = (e) => {
  game.mouse.x = Math.round(e.offsetX / SCALE);
  game.mouse.y = Math.round(e.offsetY / SCALE);

  console.log('onmousemove', game.mouse, game.findElementAt(game.mouse));
};
