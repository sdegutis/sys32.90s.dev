import { Listener, Reactive } from "../util/events.js";
import { Bitmap } from "./bitmap.js";
import { CRT } from "./crt.js";
import { Font } from "./font.js";
import { FS } from "./fs.js";
import { View } from "./view.js";

export class System {

  readonly root: View;
  focused: View;
  font = Font.crt2025;
  keys: Record<string, boolean> = {};
  mouse = { x: 0, y: 0, button: 0 };
  crt: CRT;

  onTick = new Listener<number>();

  needsRedraw = true;

  #hovered: View;
  #trackingMouse?: { move: () => void, up?: () => void };

  #destroyer = new AbortController();

  fs = new FS();

  constructor(canvas: HTMLCanvasElement) {
    this.crt = new CRT(canvas);
    canvas.tabIndex = 0;
    canvas.focus();

    this.root = this.make(View, { background: 0x00000000 });
    this.focused = this.root;
    this.#hovered = this.root;

    this.resize(canvas.width, canvas.height);

    canvas.addEventListener('keydown', (e) => {
      e.preventDefault();
      if (e.key === 'F5') location.reload();
      this.keys[e.key] = true;

      let node: View | undefined = this.focused;
      while (node) {
        if (node.onKeyDown && node.onKeyDown(e.key)) {
          break;
        }
        node = node.parent;
      }

      this.needsRedraw = true;
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('keyup', (e) => {
      e.preventDefault();
      this.keys[e.key] = false;
      this.needsRedraw = true;
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('mousedown', (e) => {
      canvas.focus();
      e.preventDefault();
      this.mouse.button = e.button;
      this.#hovered.focus();
      this.#hovered.onMouseDown?.();
      this.needsRedraw = true;
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('mousemove', (e) => {
      e.preventDefault();
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
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.#trackingMouse?.up?.();
      this.#trackingMouse = undefined!;
      this.needsRedraw = true;
    }, { signal: this.#destroyer.signal });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      let node: View | undefined = this.#hovered;
      while (node) {
        if (node.onScroll) {
          node.onScroll(e.deltaY < 0);
          this.needsRedraw = true;
          return;
        }
        node = node.parent;
      }
    }, { signal: this.#destroyer.signal })

    let alive = true;
    this.#destroyer.signal.addEventListener('abort', () => {
      alive = false;
    });

    let last = +document.timeline.currentTime!;
    const update = (t: number) => {
      const delta = t - last;
      if (delta >= 30) {
        this.onTick.dispatch(delta);

        if (this.needsRedraw) {
          this.needsRedraw = false;

          this.#draw(this.root);

          const cursor = this.#hovered.cursor ?? pointer;
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
    config: Partial<T>,
    ...children: any[]
  ): T {
    const view = new ctor(this);
    Object.assign(view, { children }, config);
    this.#enableDataSources(view);
    view.init?.();
    return view;
  }

  #enableDataSources(view: View) {
    for (let [key, val] of Object.entries(view)) {
      if (key === 'dataSources') continue;
      view.setDataSource(key as keyof View, new Reactive(val));
    }
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
    this.#layoutTree(node);
    this.#checkUnderMouse();
    this.needsRedraw = true;
  }

  #layoutTree(node: View) {
    node.layout?.();
    for (let i = 0; i < node.children.length; i++) {
      this.#layoutTree(node.children[i]);
    }
  }

  #adjustTree(node: View) {
    for (let i = 0; i < node.children.length; i++) {
      this.#adjustTree(node.children[i]);
    }
    node.adjust?.();
  }

  #checkUnderMouse() {
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

  focus(view: View) {
    if (view === this.focused) return;

    this.focused.focused = false;
    this.focused.onBlur?.();

    this.focused = view;
    this.focused.focused = true;

    let node: View | undefined = view;
    while (node) {
      node.onFocus?.();
      node = node.parent;
    }
  }

  #hover(node: View, x: number, y: number): View | null {
    if (!node.visible) return null;

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

    node.mouse.x = x;
    node.mouse.y = y;

    let i = node.children.length;
    while (i--) {
      const child = node.children[i];
      const found = this.#hover(child, x - child.x, y - child.y);
      if (found) return found;
    }

    if (node.passthrough) return null;

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
