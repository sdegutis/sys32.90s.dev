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
