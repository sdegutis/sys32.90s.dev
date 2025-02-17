export class Screen {

  root;
  focused: Box;
  font = Font.crt2025;
  keys: Record<string, boolean> = {};
  mouse = { x: 0, y: 0, button: 0 };

  needsRedraw = true;

  #allHovered: Box[] = [];
  #hovered: Box;
  #trackingMouse?: { move: () => void, up?: () => void };

  pixels;

  #camera = { x: 0, y: 0 };
  #context;
  #imgdata;

  #destroyer = new AbortController();

  constructor(public canvas: HTMLCanvasElement) {
    canvas.style.imageRendering = 'pixelated';
    canvas.style.backgroundColor = '#000';
    canvas.style.outline = 'none';
    canvas.style.cursor = 'none';
    canvas.tabIndex = 0;
    canvas.focus();

    this.#context = canvas.getContext('2d')!;

    this.pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
    this.#imgdata = new ImageData(this.pixels, canvas.width, canvas.height);
    for (let i = 0; i < canvas.width * canvas.height * 4; i += 4) {
      this.pixels[i + 3] = 255;
    }

    this.root = new Box();
    this.root.w = canvas.width;
    this.root.h = canvas.height;
    this.root.screen = this;

    this.focused = this.root;
    this.#hovered = this.root;

    const callbackOpts = { signal: this.#destroyer.signal };

    canvas.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.focused.onKeyDown?.(e.key);
      this.needsRedraw = true;
    }, callbackOpts);

    canvas.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.needsRedraw = true;
    }, callbackOpts);

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    }, callbackOpts);

    canvas.addEventListener('mousedown', (e) => {
      this.mouse.button = e.button;
      this.focused.onUnfocus?.();
      this.#hovered.focus();
      this.#hovered.onMouseDown?.();
      this.needsRedraw = true;
    }, callbackOpts);

    canvas.addEventListener('mousemove', (e) => {
      const x = Math.floor(e.offsetX);
      const y = Math.floor(e.offsetY);

      if (x === this.mouse.x && y === this.mouse.y) return;
      if (x >= canvas.width || y >= canvas.height) return;

      this.#allHovered.length = 0;

      this.mouse.x = x;
      this.mouse.y = y;

      const currentHovered = this.#hover(this.root, this.mouse.x, this.mouse.y)!;

      const notTracking = !this.#trackingMouse;

      if (this.#hovered !== currentHovered) {
        if (notTracking) this.#hovered.onMouseExit?.();
        this.#hovered.hovered = false;
        currentHovered.hovered = true;
        this.#hovered = currentHovered;
        if (notTracking) this.#hovered.onMouseEnter?.();
      }

      this.#trackingMouse?.move();
      if (notTracking) this.#hovered.onMouseMove?.();

      this.needsRedraw = true;
    }, callbackOpts);

    canvas.addEventListener('mouseup', (e) => {
      this.#trackingMouse?.up?.();
      this.#trackingMouse = undefined;
      this.needsRedraw = true;
    }, callbackOpts);

    canvas.addEventListener('wheel', (e) => {
      let i = this.#allHovered.length;
      while (i--) {
        const box = this.#allHovered[i];
        if (box.onScroll) {
          box.onScroll(e.deltaY < 0);
          this.needsRedraw = true;
          return;
        }
      }
    }, callbackOpts)

    let alive = true;
    this.#destroyer.signal.addEventListener('abort', () => {
      alive = false;
    });

    let last = +document.timeline.currentTime!;
    const update = (t: number) => {
      if (t - last >= 30) {
        if (this.needsRedraw) {
          this.needsRedraw = false;
          this.#draw(this.root);
          this.#hovered.drawCursor();
          this.blit();
        }
        last = t;
      }
      if (alive) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  destroy() {
    this.#destroyer.abort();
  }

  autoscale() {
    const observer = new ResizeObserver(() => {
      const rect = this.canvas.parentElement!.getBoundingClientRect();
      let w = this.canvas.width;
      let h = this.canvas.height;
      let s = 1;
      while ((w += this.canvas.width) <= rect.width &&
        (h += this.canvas.height) <= rect.height) s++;
      this.scale(s);
    });
    observer.observe(this.canvas.parentElement!);
    return observer;
  }

  scale(scale: number) {
    this.canvas.style.transform = `scale(${scale})`;
  }

  blit() {
    this.#context.putImageData(this.#imgdata, 0, 0);
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

    let x1 = x + this.#camera.x;
    let y1 = y + this.#camera.y;
    let x2 = x1 + w - 1;
    let y2 = y1 + h - 1;

    // if (this._clip.x1 > x1) x1 = this._clip.x1;
    // if (this._clip.y1 > y1) y1 = this._clip.y1;
    // if (this._clip.x2 < x2) x2 = this._clip.x2;
    // if (this._clip.y2 < y2) y2 = this._clip.y2;

    const r = c >> 24 & 0xff;
    const g = c >> 16 & 0xff;
    const b = c >> 8 & 0xff;
    const a = c & 0xff;

    for (y = y1; y <= y2; y++) {
      for (x = x1; x <= x2; x++) {
        const i = y * cw * 4 + x * 4;

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
    this.font.print(this, x, y, c, text);
  }

  trackMouse(fns: { move: () => void, up?: () => void }) {
    fns.move();
    this.#trackingMouse = fns;
    return () => this.#trackingMouse = undefined;
  }

  #hover(box: Box, x: number, y: number): Box | null {
    if (box.passthrough) return null;

    const inThis = (x >= 0 && y >= 0 && x < box.w && y < box.h);
    if (!inThis) return null;

    this.#allHovered.push(box);

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

  #draw(node: Box) {
    this.#camera.x += node.x;
    this.#camera.y += node.y;

    if ((node.background & 0xff) > 0) {
      node.screen.rectFill(0, 0, node.w, node.h, node.background);
    }

    node.draw?.();

    for (let i = 0; i < node.children.length; i++) {
      this.#draw(node.children[i]);
    }

    this.#camera.x -= node.x;
    this.#camera.y -= node.y;
  }

}

export class Box {

  onScroll?: (up: boolean) => void;
  onKeyDown?: (key: string) => void;
  onMouseDown?: () => void;
  onMouseMove?: () => void;
  onMouseEnter?: () => void;
  onMouseExit?: () => void;
  onFocus?: () => void;
  onUnfocus?: () => void;
  draw?: () => void;

  screen!: Screen;
  children: Box[] = [];
  hovered = false;
  mouse = { x: 0, y: 0 };
  passthrough = false;

  background = 0;

  x = 0;
  y = 0;
  w = 0;
  h = 0;

  add(child: Box) {
    child.screen = this.screen;
    this.children.push(child);
  }

  drawCursor() {
    cursors.pointer.draw(this.screen, this.screen.mouse.x - 1, this.screen.mouse.y - 1);
  }

  focus() {
    this.screen.focused = this;
    this.onFocus?.();
  }

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
    text = text.toLowerCase();

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

export function dragMove(screen: Screen, el: { x: number, y: number }) {
  const startMouse = { x: screen.mouse.x, y: screen.mouse.y };
  const startElPos = { x: el.x, y: el.y };
  return () => {
    const offx = startMouse.x - startElPos.x;
    const offy = startMouse.y - startElPos.y;
    const diffx = screen.mouse.x - startElPos.x;
    const diffy = screen.mouse.y - startElPos.y;
    el.x = startElPos.x + diffx - offx;
    el.y = startElPos.y + diffy - offy;
  };
}

export function dragResize(screen: Screen, el: { w: number, h: number }) {
  const startMouse = { x: screen.mouse.x, y: screen.mouse.y };
  const startElPos = { w: el.w, h: el.h };
  return () => {
    const offx = startMouse.x - startElPos.w;
    const offy = startMouse.y - startElPos.h;
    const diffx = screen.mouse.x - startElPos.w;
    const diffy = screen.mouse.y - startElPos.h;
    el.w = startElPos.w + diffx - offx;
    el.h = startElPos.h + diffy - offy;
  };
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

const cursors = {
  pointer: new Bitmap([0x00000099, 0xffffffff], [
    1, 1, 1, 1, -1,
    1, 2, 2, 1, -1,
    1, 2, 1, 1, -1,
    1, 1, 1, -1,
  ]),
};
