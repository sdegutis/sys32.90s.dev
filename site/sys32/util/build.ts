import { View } from "../core/view.js";
import { System } from "../core/system.js";

export function build<T extends View>(
  sys: System,
  ctor: { new(sys: System): T },
  config: Partial<T>,
  ...children: View[]
): T {
  const t = new ctor(sys);
  if (children.length > 0) t.children = children;
  Object.assign(t, config);
  return t;
}

export function makeBuilder(sys: System) {
  return <T extends View>(
    ctor: { new(sys: System): T },
    config: Partial<T>,
    ...children: View[]
  ): T => build(sys, ctor, config, ...children);
}
