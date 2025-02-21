import { Group } from "../containers/group.js";
import { Paned } from "../containers/paned.js";
import { Panel } from "../containers/panel.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { System } from "../core/system.js";
import { View } from "../core/view.js";
import { makeFlowLayout, makeVacuumLayout } from "../util/layouts.js";

export class Workspace {

  sys: System;
  desktop: View;
  #taskbar: View;
  #panels: View;

  constructor(sys: System) {
    this.sys = sys;

    const $ = sys.make.bind(sys);

    let big = false;

    sys.root.layout = makeVacuumLayout();

    this.desktop = $(View, { background: 0x333333ff });
    this.#panels = $(Group, { background: 0x222222ff });

    this.#taskbar = $(Spaced, { background: 0x000000ff },
      this.#panels,
      $(Group, {},
        $(Clock, { padding: 2 }),
        $(Button, {
          background: 0x222222ff,
          padding: 2,
          onClick: () => {
            big = !big;
            sys.resize(320 * (+big + 1), 180 * (+big + 1));
          },
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


  addProgram(title: string, launch: (ws: Workspace) => void) {
    const $ = this.sys.make.bind(this.sys);
    this.#panels.addChild($(Button, {
      padding: 2,
      onClick: () => {
        launch(this);
        this.sys.layoutTree();
      },
    }, $(Label, { text: title })));
    this.sys.layoutTree();
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
