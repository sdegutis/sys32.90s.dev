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
