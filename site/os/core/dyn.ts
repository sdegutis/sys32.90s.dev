import { Reactive } from "../util/events.js";

type Dyn<T> = T
  & { [K in keyof T as K extends `$${infer S}` ? S : never]: T[K] extends Reactive<infer R> ? R : never }
  & { [K in keyof T as K extends `$${string}` ? never : `$${K & string}`]: Reactive<T[K]> };

type EnsureReactive<T> = { [K in keyof T as K extends `$${string}` ? K : never]: Reactive<any> };

type No$$ = { [K in `$$${string}`]: never };

export function makeDynamic<T extends EnsureReactive<T>>(o: T & No$$): Dyn<T> {
  for (let [key, val] of Object.entries(o)) {
    if (key.startsWith('$')) {
      const dkey = key as keyof T;
      Object.defineProperty(o, dkey, {
        value: val,
        enumerable: false,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(o, key.slice(1), {
        configurable: true,
        enumerable: true,
        set: (v) => (o[dkey] as Reactive<any>).update(v),
        get: () => (o[dkey] as Reactive<any>).data,
      });
    }
  }
  for (let [key, val] of Object.entries(o)) {
    if (!key.startsWith('$')) {
      const dkey = `$${key}` as keyof T;
      if (!o[dkey]) {
        Object.defineProperty(o, dkey, {
          value: new Reactive(val),
          enumerable: false,
          configurable: true,
          writable: true,
        });
      }
      if (!Object.getOwnPropertyDescriptor(o, key)?.get) {
        Object.defineProperty(o, key, {
          configurable: true,
          enumerable: true,
          set: (v) => (o[dkey] as Reactive<any>).update(v),
          get: () => (o[dkey] as Reactive<any>).data,
        });
      }
    }
  }
  return o as any;
}
