import { Listener, Reactive } from "../util/events.js";
import { crt } from "./crt.js";
import { sys, type Cursor } from "./system.js";

export class View {

  init?(): void;
  onScroll?(up: boolean): void;
  onKeyDown?(key: string): boolean;
  onMouseDown?(): void;
  onMouseMove?(): void;
  onFocus?(): void;
  onBlur?(): void;
  layout?(): void;
  adjust?(): void;
  adopted?(): void;
  abandoned?(): void;
  childrenChanged?(): void;

  id = '';

  x = 0;
  y = 0;
  w = 0;
  h = 0;
  background = 0x00000000;
  passthrough = false;
  visible = true;
  focused = false;
  hovered = false;

  #children: View[] = [];
  get children(): ReadonlyArray<View> { return this.#children; }
  get firstChild(): View | undefined { return this.children[0]; }
  get lastChild(): View | undefined { return this.children[this.children.length - 1]; }

  mouse = { x: 0, y: 0 };
  cursor: Cursor | undefined;

  parent?: View;

  set children(children: View[]) {
    for (const child of this.#children) {
      if (child.parent === this) {
        child.parent = undefined!;
        child.abandoned?.();
      }
    }
    this.#children = children;
    for (const child of children) {
      child.parent = this;
      child.adopted?.();
    }
    this.childrenChanged?.();
  }

  addChild(child: View, pos?: number) {
    child.parent?.removeChild(child);
    const i = pos ?? this.#children.length;
    this.#children.splice(i, 0, child);
    child.parent = this;
    child.adopted?.();
    this.childrenChanged?.();
  }

  removeChild(child: View) {
    const i = this.#children.indexOf(child);
    if (i === -1) return;
    this.#children.splice(i, 1);
    child.parent = undefined!;
    child.abandoned?.();
    this.childrenChanged?.();
  }

  draw() {
    if ((this.background & 0x000000ff) > 0) {
      crt.rectFill(0, 0, this.w, this.h, this.background);
    }
  }

  focus() {
    sys.focus(this);
  }

  layoutTree() {
    sys.layoutTree(this);
  }

  remove() {
    this.parent?.removeChild(this);
  }

  find<T extends View>(id: string): T | null {
    if (this.id === id) return this as unknown as T;
    for (const child of this.#children) {
      const found = child.find<T>(id);
      if (found) return found;
    }
    return null;
  }

  #dataSources: Record<any, Reactive<any>> = {};

  getDataSource<K extends keyof this>(k: K): Reactive<this[K]> {
    return this.#dataSources[k];
  }

  setDataSource<K extends keyof this>(k: K, r: Reactive<this[K]>) {
    if (!(k in this.#dataSources)) {
      if (Object.getOwnPropertyDescriptor(this, k)?.get) return;
      this.#dataSources[k] = new Reactive(this[k]);

      Object.defineProperty(this, k, {
        enumerable: true,
        set: (v) => this.#dataSources[k].val = v,
        get: () => this.#dataSources[k].val,
      });
    }

    this.#dataSources[k] = r;
  }

  watch<K extends keyof this>(k: K, ...args: Parameters<Reactive<this[K]>['watch']>) {
    return this.#dataSources[k].watch(...args);
  }

}

export function $<T extends View>(
  ctor: { new(): T; },
  config: Partial<T>,
  ...children: View[]
): T {
  const view = new ctor();
  Object.assign(view, { children }, config);
  enableDataSources(view);
  view.init?.();
  return view;
}

function enableDataSources(view: View) {
  for (let [key, val] of Object.entries(view)) {
    if (typeof val === 'function') continue;
    if (val instanceof Listener) continue;
    if (val instanceof Array) continue;
    if (key === 'sys') continue;
    view.setDataSource(key as keyof View, new Reactive(val));
  }
}
