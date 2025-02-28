export class Listener<T = void, U = void> {

  #list = new Set<(data: T) => U>();

  dispatch(data: T) {
    for (const fn of this.#list) {
      fn(data);
    }
  }

  watch(fn: (data: T) => U) {
    this.#list.add(fn);
    return () => { this.#list.delete(fn); };
  }

  destroy() {
    this.#list.clear();
  }

}

export class Reactive<T> {

  #data;
  #changed = new Listener<T>();

  constructor(data: T) {
    this.#data = data;
  }

  get val() { return this.#data; }
  set val(data: T) {
    if (data === this.#data) return;
    this.#data = data;
    this.#changed.dispatch(data);
  }

  watch(fn: (data: T) => void) {
    const done = this.#changed.watch(fn);
    this.#changed.dispatch(this.val);
    return done;
  }

  destroy() {
    this.#changed.destroy();
  }

}

export function multiplex<T extends Record<string, any>>(reactives: { [K in keyof T]: Reactive<T[K]> }): Reactive<T> {
  const initial = Object.fromEntries(Object.entries<Reactive<any>>(reactives).map(([key, val]) => [key, val.val])) as T;
  const m = new Reactive(initial);
  for (const [key, r] of Object.entries<Reactive<any>>(reactives)) {
    r.watch(data => m.val = { ...m.val, [key]: data });
  }
  return m;
}
