import { Panel } from "./panel.js";
import { ws } from "../desktop/workspace.js";
import { Listener, Reactive } from "../util/events.js";
import { Bitmap } from "./bitmap.js";
import { crt } from "./crt.js";
import { Cursor } from "./cursor.js";
import { Font } from "./font.js";
import { fs } from "../fs/fs.js";
import { $, Dynamic, makeDynamic, View } from "./view.js";

const crt2025 = Font.fromString(fs.get('sys/font1.font')!);

class Memory extends Dynamic {
  font = crt2025;
}

export const mem = new Memory();
makeDynamic(mem);

mem.$data.font = livefile('sys/font1.font', Font.fromString);


function livefile<T>(path: string, to: (content: string) => T) {
  const s = fs.get(path)!;
  const r = new Reactive<T>(to(s));
  fs.watchTree(path, (type) => {
    if (type === 'disappeared') return;
    const s = fs.get(path)!;
    r.val = to(s);
    sys.needsRedraw = true;
  });
  return r;
}

const pointer = livefile('sys/pointer.bitmap', s => Cursor.fromBitmap(Bitmap.fromString(s)));

class System {

  readonly root = $(View, { background: 0x00000000 });
  focused = this.root;
  keys: Record<string, boolean> = {};
  mouse = { x: 0, y: 0 };

  onTick = new Listener<number>();

  needsRedraw = true;

  #hovered = this.root;
  #trackingMouse?: { move: () => void, up?: () => void };

  init(canvas: HTMLCanvasElement) {
    crt.init(canvas);
    this.resize(canvas.width, canvas.height);
    this.#addListeners(canvas);
    this.#startTicks();
    ws.init();
  }

  #addListeners(canvas: HTMLCanvasElement) {

    canvas.addEventListener('keydown', (e) => {
      if (e.key.length > 1 && e.key[0] === 'F') return;

      e.preventDefault();
      this.keys[e.key] = true;

      let node: View | undefined = this.focused;
      while (node) {
        if (node.onKeyDown && node.onKeyDown(e.key)) {
          break;
        }
        node = node.parent;
      }

      this.needsRedraw = true;
    });

    canvas.addEventListener('keyup', (e) => {
      e.preventDefault();
      this.keys[e.key] = false;
      this.needsRedraw = true;
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      canvas.focus();
      this.#hovered.focus();
      this.#hovered.onMouseDown?.(e.button);
      this.needsRedraw = true;
    });

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

      this.needsRedraw = true;
    });

    canvas.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.#trackingMouse?.up?.();
      this.#trackingMouse = undefined!;
      this.needsRedraw = true;
    });

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
    });

  }

  #startTicks() {
    let last = +document.timeline.currentTime!;
    const update = (t: number) => {
      const delta = t - last;
      if (delta >= 30) {
        this.onTick.dispatch(delta);

        if (this.needsRedraw) {
          this.needsRedraw = false;

          this.#draw(this.root);

          const cursor = this.#hovered.cursor ?? pointer.val;
          cursor.draw(this.mouse.x, this.mouse.y);

          crt.blit();
        }
        last = t;
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
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
    crt.resize(w, h);
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
      this.#hovered.hovered = false;
      this.#hovered = activeHovered;
      this.#hovered.hovered = true;
    }
  }

  focusedPanel: Panel | undefined;

  focus(view: View) {
    if (view === this.focused) return;

    this.focused.focused = false;
    this.focused.onBlur?.();

    this.focused = view;
    this.focused.focused = true;
    this.focused.onFocus?.();

    let newFocusedPanel;
    let node: View | undefined = view;
    while (node) {
      if (node instanceof Panel) {
        newFocusedPanel = node;
        break;
      }
      node = node.parent;
    }

    if (newFocusedPanel !== this.focusedPanel) {
      this.focusedPanel?.onPanelBlur();
      this.focusedPanel = newFocusedPanel;
      this.focusedPanel?.onPanelFocus();
    }
  }

  #hover(node: View, x: number, y: number): View | null {
    if (!node.visible) return null;

    let tx = 0;
    let ty = 0;
    let tw = node.w;
    let th = node.h;

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

    const cx1 = crt.clip.x1;
    const cx2 = crt.clip.x2;
    const cy1 = crt.clip.y1;
    const cy2 = crt.clip.y2;

    crt.clip.cx += node.x;
    crt.clip.cy += node.y;
    crt.clip.x1 = Math.max(cx1, crt.clip.cx);
    crt.clip.y1 = Math.max(cy1, crt.clip.cy);
    crt.clip.x2 = Math.min(cx2, (crt.clip.cx + node.w - 1));
    crt.clip.y2 = Math.min(cy2, (crt.clip.cy + node.h - 1));

    node.draw?.();

    for (let i = 0; i < node.children.length; i++) {
      this.#draw(node.children[i]);
    }

    crt.clip.cx -= node.x;
    crt.clip.cy -= node.y;

    crt.clip.x1 = cx1;
    crt.clip.x2 = cx2;
    crt.clip.y1 = cy1;
    crt.clip.y2 = cy2;
  }

}

export const sys = new System();
