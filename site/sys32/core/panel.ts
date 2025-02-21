import { System } from "./system.js";
import { View } from "./view.js";

export class Panel extends View {

  make<T extends {}>(
    ctor: { new(sys: System): T },
    config?: Partial<T>,
    ...children: any[]
  ): T {
    const view = Object.assign(new ctor(this.sys), { children, panel: this }, config);
    view.panel = this;
    return view;
  }

}
