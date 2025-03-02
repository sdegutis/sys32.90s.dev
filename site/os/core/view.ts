import { Listener, Reactive } from "../util/events.js";
import { crt } from "./crt.js";
import { type Cursor } from "./cursor.js";
import { sys } from "./system.js";

export class Dynamic {

  $data = Object.create(null) as {
    [K in Exclude<keyof this, '$data'>]: Reactive<any>
  };

}

export class View extends Dynamic {

  init?(): void;
  onScroll?(up: boolean): void;
  onKeyDown?(key: string): boolean;
  onMouseDown?(button: number): void;
  onFocus?(): void;
  onBlur?(): void;
  layout?(): void;
  adjust?(): void;
  adopted?(): void;
  abandoned?(): void;

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
  }

  addChild(child: View, pos?: number) {
    child.parent?.removeChild(child);
    const i = pos ?? this.#children.length;
    this.#children.splice(i, 0, child);
    child.parent = this;
    child.adopted?.();
  }

  removeChild(child: View) {
    const i = this.#children.indexOf(child);
    if (i === -1) return;
    this.#children.splice(i, 1);
    child.parent = undefined!;
    child.abandoned?.();
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

}

export function $<T extends View>(
  ctor: { new(): T; },
  config: Partial<Omit<T, '$data'> & { $data: Partial<T['$data']> }>,
  ...children: View[]
): T {
  const view = new ctor();
  Object.assign(view, { children }, config);
  makeDynamic(view);
  view.init?.();
  return view;
}

export function makeDynamic<T extends Dynamic>(o: T) {
  type K = Exclude<keyof T['$data'], '$data'>;

  for (let [key, val] of Object.entries(o)) {
    if (key === '$data') continue;
    if (typeof val === 'function') continue;
    if (val instanceof Listener) continue;
    if (val instanceof Array) continue;
    if (Object.getOwnPropertyDescriptor(o, key)?.get) continue;

    o.$data[key as K] ??= new Reactive(val);

    Object.defineProperty(o, key, {
      enumerable: true,
      set: (v) => o.$data[key as K].val = v,
      get: () => o.$data[key as K].val,
    });
  }
}
