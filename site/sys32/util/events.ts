export function multifn<T = void, U = void>() {
  const list = new Set<(data: T) => U>();

  function all(data: T) {
    for (const fn of list) {
      fn(data);
    }
  }

  all.watch = (fn: (data: T) => U) => {
    list.add(fn);
    return () => { list.delete(fn); };
  };

  return all;
}

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
  #changed = multifn<T>();

  constructor(data: T) {
    this.#data = data;
  }

  get val() { return this.#data; }
  set val(data: T) {
    this.#data = data;
    this.#changed(data);
  }

  watch(fn: (data: T) => void, initial = true) {
    const done = this.#changed.watch(fn);
    if (initial) this.#changed(this.val);
    return done;
  }

  adapt<U>(fn: (data: T) => U) {
    const r = new Reactable<U>(fn(this.val));
    const done = this.watch(data => r.val = fn(data), false);
    return r;
  }

}
