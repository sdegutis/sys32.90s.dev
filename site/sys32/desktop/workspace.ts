import { Group } from "../containers/group.js";
import { Paned } from "../containers/paned.js";
import { Panel } from "../containers/panel.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { System } from "../core/system.js";
import { View } from "../core/view.js";
import { makeVacuumLayout } from "../util/layouts.js";

export class Workspace {

  sys: System;
  desktop: View;
  #taskbar: View;

  constructor(sys: System) {
    this.sys = sys;

    const $ = sys.make.bind(sys);

    let big = false;

    sys.root.layout = makeVacuumLayout();

    this.desktop = $(View, { background: 0x333333ff });

    this.#taskbar = $(Spaced, { background: 0x000000ff },
      $(Group, { background: 0x222222ff },
        $(Button, { padding: 2, }, $(Label, { text: 'one' }))
      ),
      $(Group, { background: 0x222222ff },
        $(Button, { padding: 2, }, $(Label, { text: 'one' }))
      ),
      $(Group, {},
        $(Clock, { padding: 2 }),
        $(Button, {
          background: 0x222222ff,
          padding: 2, onClick() {
            big = !big;
            sys.resize(320 * (+big + 1), 180 * (+big + 1));
          }
        }, $(Label, { text: 'resize' }))
      ),
    );

    sys.root.children = [
      $(Paned, { vacuum: 'b', dir: 'y' },
        this.desktop,
        this.#taskbar,
      )
    ];

    sys.layoutTree();
  }

  newPanel(config: Partial<Panel>) {
    const $ = this.sys.make.bind(this.sys);
    const panel = $(Panel, config)
    this.desktop.addChild(panel);
    return panel;
  }

}

class Clock extends Group {

  #label = this.sys.make(Label);
  #timer?: ReturnType<typeof setInterval>;

  override init(): void {
    this.children = [this.#label];
    this.#updateTime();
  }

  override adopted(): void {
    this.#timer = setInterval((() => {
      this.#updateTime();
      this.sys.layoutTree();
    }), 1000);
  }

  override abandoned(): void {
    clearInterval(this.#timer);
    this.#timer = undefined!;
  }

  #updateTime() {
    this.#label.text = new Date().toLocaleTimeString('en-us');
  }

}
