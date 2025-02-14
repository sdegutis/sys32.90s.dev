const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;



const camera = { x: 0, y: 0 };

const clip = { x1: 0, y1: 0, x2: 320 - 1, y2: 180 - 1 };

export class Box {

  onMouseDown() { }
  onKeyDown(key: string) { }

  children: Box[] = [];
  hovered = false;
  mouse = { x: 0, y: 0 };
  clips = false;

  constructor(
    public x = 0,
    public y = 0,
    public w = 0,
    public h = 0,
    public background?: number,
  ) { }

  draw() {
    if (this.clips) this.clip();
    this.drawBackground();
    this.drawChildren();
    if (this.clips) this.unclip();
  }

  _oldclip = { x1: 0, y1: 0, x2: 0, y2: 0 };

  clip() {
    this._oldclip.x1 = clip.x1;
    this._oldclip.x2 = clip.x2;
    this._oldclip.y1 = clip.y1;
    this._oldclip.y2 = clip.y2;

    clip.x1 = camera.x;
    clip.y1 = camera.y;
    clip.x2 = camera.x + this.w - 1;
    clip.y2 = camera.y + this.h - 1;
  }

  unclip() {
    clip.x1 = this._oldclip.x1;
    clip.x2 = this._oldclip.x2;
    clip.y1 = this._oldclip.y1;
    clip.y2 = this._oldclip.y2;
  }

  drawBackground() {
    if (!this.background) return;
    rectFill(0, 0, this.w, this.h, this.background);
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

  drawCursor() {
    pset(mouse.x, mouse.y, 0xffffffff);
    pset(mouse.x + 1, mouse.y, 0xffffffff);
    pset(mouse.x, mouse.y + 1, 0xffffffff);
  }

  trackMouse(fns: { move: () => void, up?: () => void }) {
    const done = new AbortController();
    const opts = { signal: done.signal, passive: true };
    const wrappedUp = () => { done.abort(); fns.up?.(); };
    canvas.addEventListener('mousemove', fns.move, opts);
    canvas.addEventListener('mouseup', wrappedUp, opts);
    fns.move();
    return () => done.abort();
  }

  focus() {
    focused = this;
  }

}




new ResizeObserver(() => {
  const box = canvas.parentElement!.getBoundingClientRect();
  let w = 320;
  let h = 180;
  let s = 1;
  while (
    (w += 320) <= box.width &&
    (h += 180) <= box.height
  ) s++;
  canvas.style.transform = `scale(${s})`;
}).observe(canvas.parentElement!);







export const keys: Record<string, boolean> = {};

canvas.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  focused.onKeyDown(e.key);
}, { passive: true });

canvas.addEventListener('keyup', (e) => {
  keys[e.key] = false;
}, { passive: true });










export const root = new Box(0, 0, 320, 180, 0x000000ff);

export let focused: Box = root;

export const mouse = {
  x: 0,
  y: 0,
  button: 0,
};








let lastHovered: Box = root;

canvas.addEventListener('mousedown', (e) => {
  mouse.button = e.button;
  lastHovered.focus();
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

function findElementAt(box: Box, x: number, y: number): Box | null {
  const inThis = (x >= 0 && y >= 0 && x < box.w && y < box.h);
  if (!inThis) return null;

  box.mouse.x = x;
  box.mouse.y = y;

  let i = box.children.length;
  while (i--) {
    const child = box.children[i];
    const found = findElementAt(child, x - child.x, y - child.y);
    if (found) return found;
  }

  return box;
}

export function onWheel(fn: (up: boolean) => void) {
  const done = new AbortController();
  canvas.addEventListener('wheel',
    (e) => fn(e.deltaY < 0),
    { passive: true, signal: done.signal });
  return () => done.abort();
}






const pixels = new Uint8ClampedArray(320 * 180 * 4);
const imgdata = new ImageData(pixels, 320, 180);

for (let i = 0; i < 320 * 180 * 4; i += 4) {
  pixels[i + 3] = 255;
}


let tick = (delta: number) => { };
let last = +document.timeline.currentTime!;

function update(t: number) {
  if (t - last >= 30) {
    tick(t - last);
    root.draw();
    lastHovered.drawCursor();
    context.putImageData(imgdata, 0, 0);
    last = t;
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

export function ontick(fn: (delta: number) => void) {
  tick = fn;
}




export function pset(x: number, y: number, c: number) {
  x += camera.x;
  y += camera.y;

  if (x < clip.x1 || y < clip.y1 || x > clip.x2 || y > clip.y2) return;

  const i = y * 320 * 4 + x * 4;

  const r = c >> 24 & 0xff;
  const g = c >> 16 & 0xff;
  const b = c >> 8 & 0xff;
  const a = c & 0xff;

  if (a === 255) {
    pixels[i + 0] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }
  else {
    const ia = (255 - a) / 255;
    const aa = (a / 255);
    pixels[i + 0] = (pixels[i + 0] * ia) + (r * aa);
    pixels[i + 1] = (pixels[i + 1] * ia) + (g * aa);
    pixels[i + 2] = (pixels[i + 2] * ia) + (b * aa);
  }
}

export function rectLine(x: number, y: number, w: number, h: number, c: number) {
  for (let xx = 1; xx < w - 1; xx++) {
    pset(x + xx, y, c);
    pset(x + xx, y + h - 1, c);
  }
  for (let yy = 0; yy < h; yy++) {
    pset(x, y + yy, c);
    pset(x + w - 1, y + yy, c);
  }
}

export function rectFill(x: number, y: number, w: number, h: number, c: number) {
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      pset(x + xx, y + yy, c);
    }
  }
}








export class Selection {

  x1: number;
  y1: number;
  x!: number;
  y!: number;
  w!: number;
  h!: number;

  constructor(public box: Box) {
    this.x1 = this.box.mouse.x;
    this.y1 = this.box.mouse.y;
    this.update();
  }

  update() {
    const x2 = this.box.mouse.x;
    const y2 = this.box.mouse.y;
    this.x = this.x1 < x2 ? this.x1 : x2;
    this.y = this.y1 < y2 ? this.y1 : y2;
    this.w = (this.x1 < x2 ? x2 - this.x1 : this.x1 - x2) + 1;
    this.h = (this.y1 < y2 ? y2 - this.y1 : this.y1 - y2) + 1;
  }

}

export class TileSelection extends Selection {

  tx1!: number;
  ty1!: number;
  tx2!: number;
  ty2!: number;

  update() {
    super.update();
    this.tx1 = Math.floor(this.x / 4);
    this.ty1 = Math.floor(this.y / 4);
    this.tx2 = Math.ceil(this.x / 4 + this.w / 4);
    this.ty2 = Math.ceil(this.y / 4 + this.h / 4);
  }

}

export class Mover {

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











export class Button extends Box {

  text = '';
  color: number = 0xffffffff;

  clicking = false;
  onClick() { }

  onMouseDown(): void {
    this.clicking = true;

    const cancel = this.trackMouse({
      move: () => {
        if (!this.hovered) {
          cancel();
          this.clicking = false;
        }
      },
      up: () => {
        this.onClick();
        this.clicking = false;
      },
    });
  }

  drawBackground() {
    super.drawBackground();

    if (this.clicking) {
      rectFill(0, 0, this.w, this.h, 0xffffff22);
    }
    else if (this.hovered) {
      rectFill(0, 0, this.w, this.h, 0xffffff11);
    }

    print(2, 2, this.color, this.text);
  }

}

export class RadioGroup {

  buttons: RadioButton[] = [];

  add(button: RadioButton) {
    this.buttons.push(button);
    button.group = this;
  }

  select(button: RadioButton) {
    for (const b of this.buttons) {
      b.selected = (b === button);
    }
  }

}

export class RadioButton extends Button {

  drawButton() { }
  onSelect() { }

  selected = false;
  group?: RadioGroup;

  onClick(): void {
    super.onClick();
    this.group?.select(this);
    this.onSelect();
  }

  drawBackground() {
    this.drawButton();

    if (this.selected) {
      rectLine(0, 0, this.w, this.h, 0xffffff77);
    }
    else if (this.hovered) {
      rectLine(0, 0, this.w, this.h, 0xffffff33);
    }
  }

}









export class Textbox extends Box {

  text = '';
  color = 0xffffffff;

  constructor(...args: ConstructorParameters<typeof Box>) {
    super(...args);
    this.clips = true;
  }

  onKeyDown(key: string): void {
    if (key === 'Enter') {
      this.text += '\n';
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1);
    }
    else if (mapping.includes(key)) {
      this.text += key;
    }
  }

  drawBackground(): void {
    super.drawBackground();
    print(2, 2, this.color, this.text);

    if (focused === this) {
      rectLine(0, 0, this.w, this.h, 0xffffff33);

      const drawCursor = last % 1000 < 500;
      if (drawCursor) {
        let cx = 0;
        let cy = 0;

        for (let i = 0; i < this.text.length; i++) {
          const ch = this.text[i];
          if (ch === '\n') { cy++; cx = 0; continue; }
          cx++;
        }

        print((cx * 4) + 2, (cy * 6) + 2, 0x77aaffff, '_');
      }
    }
  }

}











const mapping = `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$`;
const src = `
 xxx     xx      xxx     xx      xxx     xxx     xxx     x x     xxx     xxx     x x     x       xxx     xxx     xxx     xxx  |
 x x     xxx     x       x x     xx      xx      x       xxx      x       x      xx      x       xxx     x x     x x     x x  |
 xxx     x x     x       x x     x       x       x x     x x      x       x      xx      x       x x     x x     x x     xx   |
 x x     xxx     xxx     xx      xxx     x       xxx     x x     xxx     xx      x x     xxx     x x     x x     xxx     x    |
                                                                                                                              |
 xxx     xxx     xxx     xxx     x x     x x     x x     x x     x x     xxx                             xx       x      xxx  |
 x x     x x     x        x      x x     x x     x x      x      x x      xx                              x       x      x x  |
 xxx     xx       xx      x      x x     x x     xxx      x       x      x                        x                           |
   x     x x     xxx      x      xxx      x      xxx     x x      x      xxx              x      x                x        x  |
                                                                                                                              |
 xx      xx      xxx     x x     xxx     xxx     xxx     xxx     xxx      x               x        x       x      x      x x  |
  x        x      xx     x x     xx      x         x     xxx     x x     x x     xxx     xxx      x       x        x     x x  |
  x       x        x     xxx       x     xxx       x     x x      xx     x x              x       x       x        x          |
 xxx     xxx     xxx       x     xx      xxx       x     xxx     xx       x                      x         x      x           |
                                                                                                                              |
 x        x       x      x x     xx      xx      xx       x      x               xxx     xxx      x       xx     xx      x    |
                          x              x        x      x        x              xxx     xxx      x      xx       xx      x   |
 x        x      xxx     x x     xx      x        x       x      x               xx      xxx      x      xx       xx          |
         x        x                      xx      xx                      xxx     xxx              x       xx     xx           |
                                                                                                                              |
  x                                                                                                                           |
 x                                                                                                                            |
  x                                                                                                                           |
 x                                                                                                                            |`;

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

export function print(x: number, y: number, c: number, text: string) {
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

    if (map === undefined) {
      console.log('cant print:', ch);
    }
    else {
      for (let yy = 0; yy < 4; yy++) {
        for (let xx = 0; xx < 4; xx++) {
          const px = x + (posx * 4) + xx;
          const py = y + (posy * 6) + yy;

          if (map[yy][xx]) {
            pset(px, py, c);
          }
        }
      }
    }

    posx++;
  }
}
