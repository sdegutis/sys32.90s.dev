import { System } from "./system.js";
import { View } from "./view.js";

export class Panel {

  sys: System;
  view: View;
  name: string;

  constructor(sys: System, name: string) {
    this.sys = sys;
    this.view = this.make(View);
    this.name = name;
  }

  make<T extends View>(
    ctor: { new(panel: Panel): T },
    config?: Partial<T>,
    ...children: any[]
  ): T {
    const view = Object.assign(new ctor(this), { children }, config);
    view.init?.();
    return view;
  }

}
