import { Bitmap } from "./bitmap.js";
import { Box } from "./box.js";
import { Font } from "./font.js";

export class System {

  readonly root;
  focused: Box;
  font = Font.crt2025;
  keys: Record<string, boolean> = {};
  mouse = { x: 0, y: 0, button: 0 };

  needsRedraw = true;

  #allHovered: Box[] = [];
  #hovered: Box;
  #trackingMouse?: { move: () => void, up?: () => void };

  pixels!: Uint8ClampedArray;

  #clip = { cx: 0, cy: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
  #context;
  #imgdata!: ImageData;

  #destroyer = new AbortController();

  #ticks = new Set<(delta: number) => void>();

  constructor(public canvas: HTMLCanvasElement) {
    canvas.style.imageRendering = 'pixelated';
    canvas.style.backgroundColor = '#000';
    canvas.style.outline = 'none';
    canvas.style.cursor = 'none';
    canvas.tabIndex = 0;
    canvas.focus();

    this.#context = canvas.getContext('2d')!;
    this.root = new Box(this);
    this.focused = this.root;
    this.#hovered = this.root;

    this.resize(canvas.width, canvas.height);

    canvas.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.focused.onKeyDown?.(e.key);
      this.needsRedraw = true;
    }, { passive: true, signal: this.#destroyer.signal });

    canvas.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.needsRedraw = true;
    }, { passive: true, signal: this.#destroyer.signal });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('mousedown', (e) => {
      this.mouse.button = e.button;
      this.focused.focused = false;
      this.focused.onBlur?.();
      this.focus(this.#hovered);
      this.#hovered.onMouseDown?.();
      this.needsRedraw = true;
    }, { passive: true, signal: this.#destroyer.signal });

    canvas.addEventListener('mousemove', (e) => {
      const x = Math.floor(e.offsetX);
      const y = Math.floor(e.offsetY);

      if (x === this.mouse.x && y === this.mouse.y) return;
      if (x >= canvas.width || y >= canvas.height) return;

      this.mouse.x = x;
      this.mouse.y = y;

      this.#checkUnderMouse();

      this.#trackingMouse?.move();
      if (!this.#trackingMouse) this.#hovered.onMouseMove?.();

      this.needsRedraw = true;
    }, { passive: true, signal: this.#destroyer.signal });

    canvas.addEventListener('mouseup', (e) => {
      this.#trackingMouse?.up?.();
      this.#trackingMouse = undefined!;
      this.needsRedraw = true;
    }, { passive: true, signal: this.#destroyer.signal });

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
    }, { passive: true, signal: this.#destroyer.signal })

    let alive = true;
    this.#destroyer.signal.addEventListener('abort', () => {
      alive = false;
    });

    let last = +document.timeline.currentTime!;
    const update = (t: number) => {
      const delta = t - last;
      if (delta >= 30) {
        for (const fn of this.#ticks) {
          fn(delta);
        }

        if (this.needsRedraw) {
          this.needsRedraw = false;

          this.#draw(this.root);

          const cursor = this.#hovered.mouse.cursor ?? pointer;
          cursor.bitmap.draw(this, this.mouse.x - cursor.offset[0], this.mouse.y - cursor.offset[1]);

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

  onTick(fn: (delta: number) => void) {
    this.#ticks.add(fn);
    return () => this.#ticks.delete(fn);
  }

  trackMouse(fns: { move: () => void; up?: () => void; }) {
    fns.move();
    this.#trackingMouse = fns;
    return () => this.#trackingMouse = undefined!;
  }

  resize(w: number, h: number) {
    const canvas = this.canvas;

    canvas.width = w;
    canvas.height = h;

    this.pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
    this.#imgdata = new ImageData(this.pixels, canvas.width, canvas.height);
    for (let i = 0; i < canvas.width * canvas.height * 4; i += 4) {
      this.pixels[i + 3] = 255;
    }

    this.#clip.x2 = canvas.width - 1;
    this.#clip.y2 = canvas.height - 1;

    this.root.w = canvas.width;
    this.root.h = canvas.height;

    this.layoutTree();
    this.#autoscale();
  }

  layoutTree(node: Box = this.root) {
    this.#adjustTree(node);
    this.#layoutTree(node, node.w, node.h);
    this.#checkUnderMouse();
    this.needsRedraw = true;
  }

  #layoutTree(node: Box, w: number, h: number) {
    node.layout?.(w, h);
    for (let i = 0; i < node.children.length; i++) {
      this.#layoutTree(node.children[i], node.w, node.h);
    }
  }

  #adjustTree(node: Box) {
    for (let i = 0; i < node.children.length; i++) {
      this.#adjustTree(node.children[i]);
    }
    node.adjust?.();
  }

  #checkUnderMouse() {
    this.#allHovered.length = 0;
    const activeHovered = this.#hover(this.root, this.mouse.x, this.mouse.y)!;

    if (this.#hovered !== activeHovered) {
      this.#hovered.onMouseExit?.();
      this.#hovered = activeHovered;
      this.#hovered.onMouseEnter?.();
    }
  }

  destroy() {
    this.#destroyer.abort();
  }

  #autoscale() {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    let w = this.canvas.width;
    let h = this.canvas.height;
    let s = 1;
    while ((w += this.canvas.width) <= rect.width &&
      (h += this.canvas.height) <= rect.height) s++;
    this.scale(s);
  }

  autoscale() {
    const observer = new ResizeObserver(() => this.#autoscale());
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

    let x1 = x + this.#clip.cx;
    let y1 = y + this.#clip.cy;
    let x2 = x1 + w - 1;
    let y2 = y1 + h - 1;

    if (this.#clip.x1 > x1) x1 = this.#clip.x1;
    if (this.#clip.y1 > y1) y1 = this.#clip.y1;
    if (this.#clip.x2 < x2) x2 = this.#clip.x2;
    if (this.#clip.y2 < y2) y2 = this.#clip.y2;

    const r = c >> 24 & 0xff;
    const g = c >> 16 & 0xff;
    const b = c >> 8 & 0xff;
    const a = c & 0xff;

    // if (a === 0) return;

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

  focus(node: Box) {
    this.focused = node;
    this.focused.focused = true;
    node.onFocus?.();
  }

  #hover(node: Box, x: number, y: number): Box | null {
    if (node.passthrough || !node.visible) return null;

    let tx = 0;
    let ty = 0;
    let tw = node.w;
    let th = node.h;
    if (node.trackingArea) {
      tx = node.trackingArea.x;
      ty = node.trackingArea.y;
      tw = tx + node.trackingArea.w;
      th = ty + node.trackingArea.h;
    }

    const inThis = (x >= tx && y >= ty && x < tw && y < th);
    if (!inThis) return null;

    this.#allHovered.push(node);

    node.mouse.x = x;
    node.mouse.y = y;

    let i = node.children.length;
    while (i--) {
      const child = node.children[i];
      const found = this.#hover(child, x - child.x, y - child.y);
      if (found) return found;
    }

    return node;
  }

  #draw(node: Box) {
    if (!node.visible) return;

    const cx1 = this.#clip.x1;
    const cx2 = this.#clip.x2;
    const cy1 = this.#clip.y1;
    const cy2 = this.#clip.y2;

    // TODO: skip drawing if entirely clipped?

    this.#clip.cx += node.x;
    this.#clip.cy += node.y;
    this.#clip.x1 = Math.max(cx1, this.#clip.cx);
    this.#clip.y1 = Math.max(cy1, this.#clip.cy);
    this.#clip.x2 = Math.min(cx2, (this.#clip.cx + node.w - 1));
    this.#clip.y2 = Math.min(cy2, (this.#clip.cy + node.h - 1));

    if ((node.background & 0x000000ff) > 0) {
      node.sys.rectFill(0, 0, node.w, node.h, node.background);
    }

    node.draw?.();

    for (let i = 0; i < node.children.length; i++) {
      this.#draw(node.children[i]);
    }

    this.#clip.cx -= node.x;
    this.#clip.cy -= node.y;

    this.#clip.x1 = cx1;
    this.#clip.x2 = cx2;
    this.#clip.y1 = cy1;
    this.#clip.y2 = cy2;
  }

}

export function build<T extends Box>(
  sys: System,
  ctor: { new(sys: System): T },
  config: Partial<T>,
  ...children: Box[]
): T {
  const t = new ctor(sys);
  if (children.length > 0) t.children = children;
  Object.assign(t, config);
  return t;
}

export function makeBuilder(sys: System) {
  return <T extends Box>(
    ctor: { new(sys: System): T },
    config: Partial<T>,
    ...children: Box[]
  ): T => build(sys, ctor, config, ...children);
}

const pointer: Cursor = {
  bitmap: new Bitmap([0x000000cc, 0xffffffff], 4, [
    1, 1, 1, 1,
    1, 2, 2, 1,
    1, 2, 1, 1,
    1, 1, 1, 0,
  ]),
  offset: [1, 1],
};

export interface Cursor {
  bitmap: Bitmap,
  offset: [number, number],
}
