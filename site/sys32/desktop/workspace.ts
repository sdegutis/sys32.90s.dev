import { Group } from "../containers/group.js";
import { Paned } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { System } from "../core/system.js";
import { View } from "../core/view.js";
import { makeFlowLayout, makeVacuumLayout } from "../util/layouts.js";
import { Clock } from "./clock.js";
import { Panel } from "./panel.js";

export class Workspace {

  sys: System;

  #icons: View;
  #desktop: View;
  #taskbar: View;
  #panels: View;

  constructor(sys: System) {
    this.sys = sys;

    const $ = sys.make.bind(sys);

    let big = false;

    sys.root.layout = makeVacuumLayout();

    this.#icons = $(View, {
      background: 0x330000ff,
      layout: makeFlowLayout(3, 10),
      adjust: function () {
        this.x = this.y = 0;
        this.w = this.parent!.w;
        this.h = this.parent!.h;
      }
    });

    this.#desktop = $(View, {}, this.#icons);

    this.#panels = $(Group, { gap: 2 });

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
            sys.layoutTree();
          },
        }, $(Label, { text: 'resize' }))
      ),
    );

    sys.root.children = [
      $(Paned, { vacuum: 'b', dir: 'y' },
        this.#desktop,
        this.#taskbar,
      )
    ];

    sys.layoutTree();
  }

  newPanel(config: Partial<Panel>) {
    const $ = this.sys.make.bind(this.sys);
    const panel = $(Panel, {
      ...config,
      x: 20, y: 20, w: 240, h: 140,
    });
    this.#desktop.addChild(panel);

    const button = $(Button, {}, $(Label, { padding: 2, text: panel.title }));
    button.onClick = () => {
      panel.show();
      this.sys.focus(panel);
    };
    this.#panels.addChild(button);
    this.sys.layoutTree(this.#panels);

    panel.didClose.listen(() => {
      button.parent?.removeChild(button);
      this.sys.layoutTree(this.#panels);
    });

    return panel;
  }

  addProgram(title: string, launch: (ws: Workspace) => void) {
    const $ = this.sys.make.bind(this.sys);
    this.#icons.addChild($(Button, {
      padding: 2,
      onClick: () => {
        launch(this);
        this.sys.layoutTree();
      },
    }, $(Label, { text: title })));
    this.sys.layoutTree();
  }

}
