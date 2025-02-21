import { Bitmap } from "./bitmap.js";
import { CRT } from "./crt.js";
import { Font } from "./font.js";
import { View } from "./view.js";

export class System {

  readonly root: View;
  focused: View;
  font = Font.crt2025;
  keys: Record<string, boolean> = {};
  mouse = { x: 0, y: 0, button: 0 };
  crt: CRT;

  #ticks = new Set<(delta: number) => void>();

  needsRedraw = true;

  #allHovered: View[] = [];
  #hovered: View;
  #trackingMouse?: { move: () => void, up?: () => void };

  #destroyer = new AbortController();

  constructor(canvas: HTMLCanvasElement) {
    this.crt = new CRT(canvas);
    canvas.tabIndex = 0;
    canvas.focus();

    this.root = this.make(View, { background: 0x00000000 });
    this.root.root = this.root;
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
        const view = this.#allHovered[i];
        if (view.onScroll) {
          view.onScroll(e.deltaY < 0);
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
          cursor.bitmap.draw(this.crt, this.mouse.x - cursor.offset[0], this.mouse.y - cursor.offset[1]);

          this.crt.blit();
        }
        last = t;
      }
      if (alive) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  make<T extends View>(
    ctor: { new(sys: System): T },
    config?: Partial<T>,
    ...children: any[]
  ): T {
    const view = new ctor(this);
    Object.assign(view, { children }, config);
    view.init?.();
    return view;
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
    this.root.w = w;
    this.root.h = h;
    this.mouse.x = 0;
    this.mouse.y = 0;
    this.crt.resize(w, h);
    this.layoutTree();
  }

  layoutTree(node: View = this.root) {
    this.#adjustTree(node);
    this.#layoutTree(node, node.w, node.h);
    this.#checkUnderMouse();
    this.needsRedraw = true;
  }

  #layoutTree(node: View, w: number, h: number) {
    node.layout?.(w, h);
    for (let i = 0; i < node.children.length; i++) {
      this.#layoutTree(node.children[i], node.w, node.h);
    }
  }

  #adjustTree(node: View) {
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

  focus(node: View) {
    this.focused = node;
    this.focused.focused = true;
    node.onFocus?.();
  }

  #hover(node: View, x: number, y: number): View | null {
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

  #draw(node: View) {
    if (!node.visible) return;

    const cx1 = this.crt.clip.x1;
    const cx2 = this.crt.clip.x2;
    const cy1 = this.crt.clip.y1;
    const cy2 = this.crt.clip.y2;

    // TODO: skip drawing if entirely clipped?

    this.crt.clip.cx += node.x;
    this.crt.clip.cy += node.y;
    this.crt.clip.x1 = Math.max(cx1, this.crt.clip.cx);
    this.crt.clip.y1 = Math.max(cy1, this.crt.clip.cy);
    this.crt.clip.x2 = Math.min(cx2, (this.crt.clip.cx + node.w - 1));
    this.crt.clip.y2 = Math.min(cy2, (this.crt.clip.cy + node.h - 1));

    if ((node.background & 0x000000ff) > 0) {
      this.crt.rectFill(0, 0, node.w, node.h, node.background);
    }

    node.draw?.();

    for (let i = 0; i < node.children.length; i++) {
      this.#draw(node.children[i]);
    }

    this.crt.clip.cx -= node.x;
    this.crt.clip.cy -= node.y;

    this.crt.clip.x1 = cx1;
    this.crt.clip.x2 = cx2;
    this.crt.clip.y1 = cy1;
    this.crt.clip.y2 = cy2;
  }

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
