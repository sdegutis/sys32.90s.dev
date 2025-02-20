import { System } from "../core/system.js";

export function build<T extends {}>(
  sys: System,
  ctor: { new(sys: System): T },
  config: Partial<T>,
  ...children: any[]
): T {
  return Object.assign(new ctor(sys), { children }, config);
}

export function makeBuilder(sys: System) {
  return <T extends {}>(
    ctor: { new(sys: System): T },
    config: Partial<T>,
    ...children: any[]
  ): T => Object.assign(new ctor(sys), { children }, config);
}
