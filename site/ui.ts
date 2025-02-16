export class Screen {

  root;
  focused: Box;
  font = Font.crt2025;
  keys: Record<string, boolean> = {};
  mouse = { x: 0, y: 0, button: 0 };

  needsRedraw = true;

  _hovered: Box[] = [];
  _lastHovered: Box;
  _trackingMouse?: { move: () => void, up?: () => void };

  _camera = { x: 0, y: 0 };
  _clip;
  _context;
  _pixels;
  _imgdata;

  constructor(public canvas: HTMLCanvasElement) {
    this._context = canvas.getContext('2d')!;

    this._pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
    this._imgdata = new ImageData(this._pixels, canvas.width, canvas.height);
    for (let i = 0; i < canvas.width * canvas.height * 4; i += 4) {
      this._pixels[i + 3] = 255;
    }

    this._clip = { x1: 0, y1: 0, x2: canvas.width - 1, y2: canvas.height - 1 };

    this.root = new Box(0, 0, canvas.width, canvas.height);
    this.focused = this.root;
    this._lastHovered = this.root;

    canvas.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.focused.onKeyDown?.(this, e.key);
      this.needsRedraw = true;
    }, { passive: true });

    canvas.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.needsRedraw = true;
    }, { passive: true });

    canvas.oncontextmenu = (e) => { e.preventDefault(); };

    canvas.addEventListener('mousedown', (e) => {
      this.mouse.button = e.button;
      this.focused.onUnfocus?.(this);
      this._lastHovered.focus(this);
      this._lastHovered.onMouseDown?.(this);
      this.needsRedraw = true;
    }, { passive: true });

    canvas.addEventListener('mousemove', (e) => {
      const x = Math.floor(e.offsetX);
      const y = Math.floor(e.offsetY);

      if (x === this.mouse.x && y === this.mouse.y) return;
      if (x >= canvas.width || y >= canvas.height) return;

      this._hovered.length = 0;

      this.mouse.x = x;
      this.mouse.y = y;

      const hoveredOver = this.#hover(this.root, this.mouse.x, this.mouse.y)!;

      if (this._lastHovered !== hoveredOver) {
        this._lastHovered.hovered = false;
        hoveredOver.hovered = true;
        this._lastHovered = hoveredOver;
      }

      this._trackingMouse?.move();

      this.needsRedraw = true;
    }, { passive: true });

    canvas.addEventListener('mouseup', (e) => {
      this._trackingMouse?.up?.();
      this._trackingMouse = undefined;
      this.needsRedraw = true;
    }, { passive: true });

    canvas.addEventListener('wheel', (e) => {
      let i = this._hovered.length;
      while (i--) {
        const box = this._hovered[i];
        if (box.onScroll) {
          box.onScroll(this, e.deltaY < 0);
          this.needsRedraw = true;
          return;
        }
      }
    }, { passive: true })

    let last = +document.timeline.currentTime!;
    const update = (t: number) => {
      if (t - last >= 30) {
        if (this.needsRedraw) {
          this.root.draw(this);
          this._lastHovered.drawCursor(this);
          this.blit();
        }
        last = t;
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  autoscale() {
    new ResizeObserver(() => {
      const box = this.canvas.parentElement!.getBoundingClientRect();
      let w = this.canvas.width;
      let h = this.canvas.height;
      let s = 1;
      while (
        (w += this.canvas.width) <= box.width &&
        (h += this.canvas.height) <= box.height
      ) s++;
      this.scale(s);
    }).observe(this.canvas.parentElement!);
  }

  scale(scale: number) {
    this.canvas.style.transform = `scale(${scale})`;
  }

  blit() {
    this._context.putImageData(this._imgdata, 0, 0);
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
    const cw = this.canvas.width;

    let x1 = x + this._camera.x;
    let y1 = y + this._camera.y;
    let x2 = x1 + w - 1;
    let y2 = y1 + h - 1;

    if (this._clip.x1 > x1) x1 = this._clip.x1;
    if (this._clip.y1 > y1) y1 = this._clip.y1;
    if (this._clip.x2 < x2) x2 = this._clip.x2;
    if (this._clip.y2 < y2) y2 = this._clip.y2;

    // if (x2 < x1 || y2 < y1) return;

    const r = c >> 24 & 0xff;
    const g = c >> 16 & 0xff;
    const b = c >> 8 & 0xff;
    const a = c & 0xff;

    for (y = y1; y <= y2; y++) {
      for (x = x1; x <= x2; x++) {
        const i = y * cw * 4 + x * 4;

        if (a === 255) {
          this._pixels[i + 0] = r;
          this._pixels[i + 1] = g;
          this._pixels[i + 2] = b;
        }
        else {
          const ia = (255 - a) / 255;
          const aa = (a / 255);
          this._pixels[i + 0] = (this._pixels[i + 0] * ia) + (r * aa);
          this._pixels[i + 1] = (this._pixels[i + 1] * ia) + (g * aa);
          this._pixels[i + 2] = (this._pixels[i + 2] * ia) + (b * aa);
        }
      }
    }
  }

  print(x: number, y: number, c: number, text: string) {
    this.font.print(this, x, y, c, text);
  }

  trackMouse(fns: { move: () => void, up?: () => void }) {
    fns.move();
    this._trackingMouse = fns;
    return () => this._trackingMouse = undefined;
  }

  #hover(box: Box, x: number, y: number): Box | null {
    if (box.passthrough) return null;

    const inThis = (x >= 0 && y >= 0 && x < box.w && y < box.h);
    if (!inThis) return null;

    this._hovered.push(box);

    box.mouse.x = x;
    box.mouse.y = y;

    let i = box.children.length;
    while (i--) {
      const child = box.children[i];
      const found = this.#hover(child, x - child.x, y - child.y);
      if (found) return found;
    }

    return box;
  }

}

class Clip {

  saved = { x1: 0, y1: 0, x2: 0, y2: 0 };

  set(screen: Screen, w: number, h: number) {
    this.saved.x1 = screen._clip.x1;
    this.saved.x2 = screen._clip.x2;
    this.saved.y1 = screen._clip.y1;
    this.saved.y2 = screen._clip.y2;

    screen._clip.x1 = screen._camera.x;
    screen._clip.y1 = screen._camera.y;
    screen._clip.x2 = screen._clip.x1 + w - 1;
    screen._clip.y2 = screen._clip.y1 + h - 1;
  }

  unset(screen: Screen) {
    screen._clip.x1 = this.saved.x1;
    screen._clip.x2 = this.saved.x2;
    screen._clip.y1 = this.saved.y1;
    screen._clip.y2 = this.saved.y2;
  }

}

export class Bitmap {

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

export class Box {

  onScroll?: (screen: Screen, up: boolean) => void;
  onKeyDown?: (screen: Screen, key: string) => void;
  onMouseDown?: (screen: Screen) => void;
  onFocus?: (screen: Screen) => void;
  onUnfocus?: (screen: Screen) => void;

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
      screen._camera.x += child.x;
      screen._camera.y += child.y;
      child.draw(screen);
      screen._camera.x -= child.x;
      screen._camera.y -= child.y;
    }
  }

  drawCursor(screen: Screen) {
    cursors.pointer.draw(screen, screen.mouse.x - 1, screen.mouse.y - 1);
  }

  focus(screen: Screen) {
    screen.focused = this;
    this.onFocus?.(screen);
  }

}

export class Button extends Box {

  text = '';
  color: number = 0xffffffff;

  clicking = false;
  onClick() { }

  onMouseDown = (screen: Screen) => {
    this.clicking = true;

    const cancel = screen.trackMouse({
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

  onScroll = (screen: Screen, up: boolean) => {
    console.log('scrolling', up)
  };

  onKeyDown = (screen: Screen, key: string) => {
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

    if (screen.focused === this) {
      screen.rectLine(0, 0, this.w, this.h, 0xffffff33);

      const drawCursor = +document.timeline.currentTime! % 1000 < 500;
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

  animate = false;

  onFocus = (screen: Screen) => {
    this.animate = true;
    let last = +document.timeline.currentTime!;
    const update = (t: number) => {
      if (t - last >= 30) {
        screen.needsRedraw = true;
        last = t;
      }
      if (this.animate) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  onUnfocus = () => {
    this.animate = false;
  };

}

export class Font {

  static crt2025 = new Font(3, 4, 16,
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

  print(screen: Screen, x: number, y: number, c: number, text: string) {
    let posx = 0;
    let posy = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (ch === '\n') {
        posy++;
        posx = 0;
        continue;
      }

      const map = this.chars[ch];

      for (let yy = 0; yy < 4; yy++) {
        for (let xx = 0; xx < 3; xx++) {
          const px = x + (posx * 4) + xx;
          const py = y + (posy * 6) + yy;

          if (map[yy][xx]) {
            screen.pset(px, py, c);
          }
        }
      }

      posx++;
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

  constructor(private screen: Screen, private el: Box) {
    this.startMouse = { x: screen.mouse.x, y: screen.mouse.y };
    this.startElPos = { x: el.x, y: el.y };
  }

  update() {
    const offx = this.startMouse.x - this.startElPos.x;
    const offy = this.startMouse.y - this.startElPos.y;
    const diffx = this.screen.mouse.x - this.startElPos.x;
    const diffy = this.screen.mouse.y - this.startElPos.y;
    this.el.x = this.startElPos.x + diffx - offx;
    this.el.y = this.startElPos.y + diffy - offy;
  }

}

const cursors = {
  pointer: new Bitmap([0x00000099, 0xffffffff], [
    1, 1, 1, 1, -1,
    1, 2, 2, 1, -1,
    1, 2, 1, 1, -1,
    1, 1, 1, -1,
  ]),
};
