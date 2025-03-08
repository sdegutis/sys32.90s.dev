export class Listener<T = void, U = void> {

  private list = new Set<(data: T) => U>()

  dispatch(data: T) {
    for (const fn of this.list) {
      fn(data)
    }
  }

  watch(fn: (data: T) => U) {
    this.list.add(fn)
    return () => { this.list.delete(fn) }
  }

  destroy() {
    this.clear()
  }

  clear() {
    this.list.clear()
  }

}

export class Reactive<T> {

  readonly data
  private changed = new Listener<T>()

  constructor(data: T) {
    this.data = data
  }

  update(data: T) {
    if (data === this.data) return
    (this as any).data = data
    this.changed.dispatch(data)
  }

  watch(fn: (data: T) => void) {
    const done = this.changed.watch(fn)
    fn(this.data)
    return done
  }

  adapt<U>(fn: (data: T) => U) {
    const r = new Reactive(fn(this.data))
    this.watch(d => r.update(fn(d)))
    return r
  }

  destroy() {
    this.changed.destroy()
  }

}

export function multiplex<T extends Record<string, any>>(reactives: { [K in keyof T]: Reactive<T[K]> }): Reactive<T> {
  const initial = Object.fromEntries(Object.entries<Reactive<any>>(reactives).map(([key, val]) => [key, val.data])) as T
  const m = new Reactive(initial)
  for (const [key, r] of Object.entries<Reactive<any>>(reactives)) {
    r.watch(data => m.update({ ...m.data, [key]: data }))
  }
  return m
}
