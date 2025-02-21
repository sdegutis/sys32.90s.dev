import { PanelView } from "../containers/panelview.js";
import { System } from "./system.js";
import { View } from "./view.js";

export class Panel {

  sys: System;
  view: PanelView;

  constructor(sys: System, config: Partial<PanelView>, makeContent?: (panel: Panel) => View) {
    this.sys = sys;
    if (makeContent) config.content = makeContent(this);
    this.view = this.make(PanelView, config);
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

  close() {

  }

  minimize() {

  }

  maximize() {
    // this.window.x = this.window.y = 0;
    // this.window.w = this.ws.desktop.w;
    // this.window.h = this.ws.desktop.h;
    // this.ws.sys.layoutTree(this.window);
  }

  show() {
    this.view.visible = true;
  }

  hide() {
    this.view.visible = false;
  }

}
