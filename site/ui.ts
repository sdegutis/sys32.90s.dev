const canvas = document.querySelector('canvas')!;





class Bitmap {

  constructor(public colors: number[], public steps: number[]) { }

  draw(screen: Screen, px: number, py: number) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < this.steps.length; i++) {
      const s = this.steps[i];
      if (s === 0) { x++; continue; }
      else if (s === -1) { y++; x = 0; }
      else screen.pset(px + x++, py + y, this.colors[s - 1]);
    }
  }

}


class Clip {

  saved = { x1: 0, y1: 0, x2: 0, y2: 0 };

  set(screen: Screen, w: number, h: number) {
    this.saved.x1 = screen.clip.x1;
    this.saved.x2 = screen.clip.x2;
    this.saved.y1 = screen.clip.y1;
    this.saved.y2 = screen.clip.y2;

    screen.clip.x1 = screen.camera.x;
    screen.clip.y1 = screen.camera.y;
    screen.clip.x2 = screen.clip.x1 + w - 1;
    screen.clip.y2 = screen.clip.y1 + h - 1;
  }

  unset(screen: Screen) {
    screen.clip.x1 = this.saved.x1;
    screen.clip.x2 = this.saved.x2;
    screen.clip.y1 = this.saved.y1;
    screen.clip.y2 = this.saved.y2;
  }

}


const hovered: Box[] = [];

export class Box {

  static cursor = new Bitmap([0x00000099, 0xffffffff], [
    1, 1, 1, 1, -1,
    1, 2, 2, 1, -1,
    1, 2, 1, 1, -1,
    1, 1, 1, -1,
  ]);

  onScroll?: (up: boolean) => void;
  onKeyDown?: (key: string) => void;
  onMouseDown?: () => void;

  children: Box[] = [];
  hovered = false;
  mouse = { x: 0, y: 0 };
  passthrough = false;

  constructor(
    public x = 0,
    public y = 0,
    public w = 0,
    public h = 0,
    public background?: number,
  ) { }

  #clip?: Clip;
  get clips() { return this.#clip !== undefined; }
  set clips(should: boolean) { this.#clip = should ? new Clip() : undefined; }

  draw(screen: Screen) {
    this.clip(screen);
    this.drawContents(screen);
    this.drawChildren(screen);
    this.unclip(screen);
  }

  clip(screen: Screen) { this.#clip?.set(screen, this.w, this.h); }
  unclip(screen: Screen) { this.#clip?.unset(screen); }

  drawContents(screen: Screen) {
    if (!this.background) return;
    screen.rectFill(0, 0, this.w, this.h, this.background);
  }

  drawChildren(screen: Screen) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      screen.camera.x += child.x;
      screen.camera.y += child.y;
      child.draw(screen);
      screen.camera.x -= child.x;
      screen.camera.y -= child.y;
    }
  }

  drawCursor(screen: Screen) {
    Box.cursor.draw(screen, mouse.x - 1, mouse.y - 1);
  }

  trackMouse(fns: { move: () => void, up?: () => void }) {
    fns.move();

    const done = new AbortController();
    const opts = { signal: done.signal, passive: true };

    let x = mouse.x;
    let y = mouse.y;

    canvas.addEventListener('mousemove', () => {
      if (x !== mouse.x || y !== mouse.y) {
        x = mouse.x;
        y = mouse.y;
        fns.move();
      }
    }, opts);

    canvas.addEventListener('mouseup', (() => {
      done.abort();
      fns.up?.();
    }), opts);

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
  focused.onKeyDown?.(e.key);
}, { passive: true });

canvas.addEventListener('keyup', (e) => {
  keys[e.key] = false;
}, { passive: true });










export const root = new Box(0, 0, 320, 180);

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
  lastHovered.onMouseDown?.();
}, { passive: true });

canvas.addEventListener('mousemove', (e) => {
  const x = Math.floor(e.offsetX);
  const y = Math.floor(e.offsetY);

  if (x === mouse.x && y === mouse.y) return;
  if (x >= 320 || y >= 180) return;

  hovered.length = 0;

  mouse.x = x;
  mouse.y = y;

  const hoveredOver = hover(root, mouse.x, mouse.y)!;

  if (lastHovered !== hoveredOver) {
    lastHovered.hovered = false;
    hoveredOver.hovered = true;
    lastHovered = hoveredOver;
  }
}, { passive: true });

canvas.oncontextmenu = (e) => { e.preventDefault(); };

function hover(box: Box, x: number, y: number): Box | null {
  if (box.passthrough) return null;

  const inThis = (x >= 0 && y >= 0 && x < box.w && y < box.h);
  if (!inThis) return null;

  hovered.push(box);

  box.mouse.x = x;
  box.mouse.y = y;

  let i = box.children.length;
  while (i--) {
    const child = box.children[i];
    const found = hover(child, x - child.x, y - child.y);
    if (found) return found;
  }

  return box;
}

canvas.addEventListener('wheel', (e) => {
  let i = hovered.length;
  while (i--) {
    const box = hovered[i];
    if (box.onScroll) {
      box.onScroll(e.deltaY < 0);
      return;
    }
  }
}, { passive: true })






let tick = (delta: number) => { };
let last = +document.timeline.currentTime!;

function update(t: number) {
  if (t - last >= 30) {
    tick(t - last);
    root.draw(sys.screen);
    lastHovered.drawCursor(sys.screen);
    sys.screen.blit();
    last = t;
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

export function ontick(fn: (delta: number) => void) {
  tick = fn;
}











export class Screen {

  camera = { x: 0, y: 0 };

  clip = { x1: 0, y1: 0, x2: 320 - 1, y2: 180 - 1 };

  pixels;
  imgdata;

  constructor(public context: CanvasRenderingContext2D) {
    this.pixels = new Uint8ClampedArray(320 * 180 * 4);
    this.imgdata = new ImageData(this.pixels, 320, 180);

    for (let i = 0; i < 320 * 180 * 4; i += 4) {
      this.pixels[i + 3] = 255;
    }
  }

  blit() {
    this.context.putImageData(this.imgdata, 0, 0);
  }

  pset(x: number, y: number, c: number) {
    this.rectFill(x, y, 1, 1, c);
  }

  rectLine(x: number, y: number, w: number, h: number, c: number) {
    this.rectFill(x + 1, y, w - 2, 1, c);
    this.rectFill(x + 1, y + h - 1, w - 2, 1, c);
    this.rectFill(x, y, 1, h, c);
    this.rectFill(x + w - 1, y, 1, h, c);
  }

  rectFill(x: number, y: number, w: number, h: number, c: number) {
    let x1 = x + this.camera.x;
    let y1 = y + this.camera.y;
    let x2 = x1 + w - 1;
    let y2 = y1 + h - 1;

    if (this.clip.x1 > x1) x1 = this.clip.x1;
    if (this.clip.y1 > y1) y1 = this.clip.y1;
    if (this.clip.x2 < x2) x2 = this.clip.x2;
    if (this.clip.y2 < y2) y2 = this.clip.y2;

    // if (x2 < x1 || y2 < y1) return;

    const r = c >> 24 & 0xff;
    const g = c >> 16 & 0xff;
    const b = c >> 8 & 0xff;
    const a = c & 0xff;

    for (y = y1; y <= y2; y++) {
      for (x = x1; x <= x2; x++) {
        const i = y * 320 * 4 + x * 4;

        if (a === 255) {
          this.pixels[i + 0] = r;
          this.pixels[i + 1] = g;
          this.pixels[i + 2] = b;
        }
        else {
          const ia = (255 - a) / 255;
          const aa = (a / 255);
          this.pixels[i + 0] = (this.pixels[i + 0] * ia) + (r * aa);
          this.pixels[i + 1] = (this.pixels[i + 1] * ia) + (g * aa);
          this.pixels[i + 2] = (this.pixels[i + 2] * ia) + (b * aa);
        }
      }
    }
  }

  print(x: number, y: number, c: number, text: string) {
    let posx = 0;
    let posy = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (ch === '\n') {
        posy++;
        posx = 0;
        continue;
      }

      const map = font.chars[ch];

      for (let yy = 0; yy < 4; yy++) {
        for (let xx = 0; xx < 3; xx++) {
          const px = x + (posx * 4) + xx;
          const py = y + (posy * 6) + yy;

          if (map[yy][xx]) {
            this.pset(px, py, c);
          }
        }
      }

      posx++;
    }
  }

}












class Sys {

  screen;

  constructor(public canvas: HTMLCanvasElement) {
    this.screen = new Screen(this.canvas.getContext('2d')!);

    console.log(this.canvas);
    console.log(this.screen);
  }

}

const sys = new Sys(canvas);










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

  constructor(box: Box, public size: number) {
    super(box);
  }

  tx1!: number;
  ty1!: number;
  tx2!: number;
  ty2!: number;

  update() {
    super.update();
    this.tx1 = Math.floor(this.x / this.size);
    this.ty1 = Math.floor(this.y / this.size);
    this.tx2 = Math.ceil(this.x / this.size + this.w / this.size);
    this.ty2 = Math.ceil(this.y / this.size + this.h / this.size);
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

  onMouseDown = () => {
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
  };

  drawContents(screen: Screen) {
    super.drawContents(screen);

    if (this.clicking) {
      screen.rectFill(0, 0, this.w, this.h, 0xffffff22);
    }
    else if (this.hovered) {
      screen.rectFill(0, 0, this.w, this.h, 0xffffff11);
    }

    screen.print(2, 2, this.color, this.text);
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

  drawButton(screen: Screen) { }
  onSelect() { }

  selected = false;
  group?: RadioGroup;

  onClick(): void {
    super.onClick();
    this.group?.select(this);
    this.onSelect();
  }

  drawContents(screen: Screen) {
    this.drawButton(screen);

    if (this.selected) {
      screen.rectLine(0, 0, this.w, this.h, 0xffffff77);
    }
    else if (this.hovered) {
      screen.rectLine(0, 0, this.w, this.h, 0xffffff33);
    }
  }

}

export class Label extends Box {

  color = 0xffffffff;

  passthrough = true;

  constructor(public text: string, ...args: ConstructorParameters<typeof Box>) {
    super(...args);
  }

  drawContents(screen: Screen): void {
    screen.print(0, 0, this.color, this.text);
  }

}

export class Checkbox extends Box {

  checked = false;

  onChange() { }

  drawContents(screen: Screen): void {
    screen.rectLine(0, 0, 6, 6, this.hovered ? 0xffffffff : 0x777777ff);
    if (this.checked) {
      screen.rectFill(2, 2, 2, 2, 0xffffffff);
    }
  }

  onMouseDown = () => {
    this.checked = !this.checked;
    this.onChange();
  };

}








export class TextField extends Box {

  text = '';
  color = 0xffffffff;

  constructor(...args: ConstructorParameters<typeof Box>) {
    super(...args);
    this.clips = true;
  }

  onScroll = (up: boolean) => {
    console.log('scrolling', up)
  };

  onKeyDown = (key: string) => {
    if (key === 'Enter') {
      this.text += '\n';
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1);
    }
    else {
      this.text += key.toLowerCase();
    }
  };

  // onMouseDown(): void {
  //   this.trackMouse({
  //     move: () => console.log(this.mouse)
  //   });
  // }

  drawContents(screen: Screen): void {
    super.drawContents(screen);
    screen.print(2, 2, this.color, this.text);

    if (focused === this) {
      screen.rectLine(0, 0, this.w, this.h, 0xffffff33);

      const drawCursor = last % 1000 < 500;
      if (drawCursor) {
        let cx = 0;
        let cy = 0;

        for (let i = 0; i < this.text.length; i++) {
          const ch = this.text[i];
          if (ch === '\n') { cy++; cx = 0; continue; }
          cx++;
        }

        screen.print((cx * 4) + 2, (cy * 6) + 2, 0x77aaffff, '_');
      }
    }
  }

}









class Font {

  chars: Record<string, boolean[][]> = {};

  constructor(w: number, h: number, perRow: number, map: string, bits: string) {
    bits = bits.replace(/\|?\n/g, '');

    for (let i = 0; i < map.length; i++) {
      const ch = map[i];

      const grid: boolean[][] = [];
      this.chars[ch] = grid;

      for (let y = 0; y < h; y++) {
        const row: boolean[] = [];
        grid.push(row);

        for (let x = 0; x < w; x++) {
          const rw = w + 3;
          const py = (Math.floor(i / perRow) * rw * perRow * (h + 1)) + y * rw * perRow;
          const px = (i % perRow) * rw + 2 + x;
          row.push(bits[px + py] !== ' ');
        }
      }
    }
  }

}

const defaultFont = new Font(3, 4, 16,
  `abcdefghijklmnopqrstuvwxyz .,'!?1234567890-+/()":;%*=[]<>_&#|{}\`$@~^`,
  `
| xxx | xx  | xxx | xx  | xxx | xxx | xxx | x x | xxx | xxx | x x | x   | xxx | xxx | xxx | xxx |
| x x | xxx | x   | x x | xx  | xx  | x   | xxx |  x  |  x  | xx  | x   | xxx | x x | x x | x x |
| xxx | x x | x   | x x | x   | x   | x x | x x |  x  |  x  | xx  | x   | x x | x x | x x | xx  |
| x x | xxx | xxx | xx  | xxx | x   | xxx | x x | xxx | xx  | x x | xxx | x x | x x | xxx | x   |
|     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| xxx | xxx | xxx | xxx | x x | x x | x x | x x | x x | xxx |     |     |     | xx  |  x  | xxx |
| x x | x x | x   |  x  | x x | x x | x x |  x  | x x |  xx |     |     |     |  x  |  x  | x x |
| xxx | xx  |  xx |  x  | x x | x x | xxx |  x  |  x  | x   |     |     |  x  |     |     |     |
|   x | x x | xxx |  x  | xxx |  x  | xxx | x x |  x  | xxx |     |  x  | x   |     |  x  |   x |
|     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| xx  | xx  | xxx | x x | xxx | xxx | xxx | xxx | xxx |  x  |     |  x  |   x |   x |  x  | x x |
|  x  |   x |  xx | x x | xx  | x   |   x | xxx | x x | x x | xxx | xxx |  x  |  x  |   x | x x |
|  x  |  x  |   x | xxx |   x | xxx |   x | x x |  xx | x x |     |  x  |  x  |  x  |   x |     |
| xxx | xxx | xxx |   x | xx  | xxx |   x | xxx | xx  |  x  |     |     | x   |   x |  x  |     |
|     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| x   |  x  |  x  | x x | xx  | xx  | xx  |  x  | x   |     | xxx | xxx |  x  |  xx | xx  | x   |
|     |     |     |  x  |     | x   |  x  | x   |  x  |     | x x | xxx |  x  | xx  |  xx |  x  |
| x   |  x  | xxx | x x | xx  | x   |  x  |  x  | x   |     | xx  | xxx |  x  | xx  |  xx |     |
|     | x   |  x  |     |     | xx  | xx  |     |     | xxx | xxx |     |  x  |  xx | xx  |     |
|     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
|  x  |  xx | xx  |  x  |     |     |     |     |     |     |     |     |     |     |     |     |
| x   | x x |  xx | x x |     |     |     |     |     |     |     |     |     |     |     |     |
|  x  | x   |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| x   |  xx |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
`);

let font = defaultFont;
