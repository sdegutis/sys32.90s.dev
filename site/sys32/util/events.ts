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
