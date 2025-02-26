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

}

export class Reactable<T> {

  #data;
  #changed = new Listener<T>();

  constructor(data: T) {
    this.#data = data;
  }

  get val() { return this.#data; }
  set val(data: T) {
    this.#data = data;
    this.#changed.dispatch(data);
  }

  watch(fn: (data: T) => void, initial = true) {
    const done = this.#changed.watch(fn);
    if (initial) this.#changed.dispatch(this.val);
    return done;
  }

  adapt<U>(fn: (data: T) => U) {
    const reactive = new Reactable<U>(fn(this.val));
    const disconnect = this.watch(data => reactive.val = fn(data), false);
    return { reactive, disconnect };
  }

}

export function multiplex<T extends Record<string, any>>(reactives: { [K in keyof T]: Reactable<T[K]> }): Reactable<T> {
  const initial = Object.fromEntries(Object.entries<Reactable<any>>(reactives).map(([key, val]) => [key, val.val])) as T;
  const m = new Reactable(initial);
  for (const [key, r] of Object.entries<Reactable<any>>(reactives)) {
    r.watch(data => m.val = { ...m.val, [key]: data });
  }
  return m;
}
