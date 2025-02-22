export class EventManager<T = void> {

  #listeners = new Set<(d: T) => void>();

  listen(fn: (d: T) => void) {
    this.#listeners.add(fn);
    return () => { this.#listeners.delete(fn); }
  }

  dispatch(d: T) {
    for (const fn of this.#listeners) {
      fn(d);
    }
  }

}
