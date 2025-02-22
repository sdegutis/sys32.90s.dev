import { Group } from "../containers/group.js";
import { Paned } from "../containers/paned.js";
import { Panel } from "../containers/panel.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { System } from "../core/system.js";
import { View } from "../core/view.js";
import { makeFlowLayout, makeVacuumLayout } from "../util/layouts.js";
import { Clock } from "./clock.js";

export class Workspace {

  sys: System;

  #iconArea: View;
  #windowArea: View;
  #taskbar: View;
  #panels: View;

  constructor(sys: System) {
    this.sys = sys;

    const $ = sys.make.bind(sys);

    let big = false;

    sys.root.layout = makeVacuumLayout();

    this.#windowArea = $(View, { background: 0x00000000 });
    this.#iconArea = $(View, { background: 0x333333ff, layout: makeFlowLayout(3, 10) });
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
        $(View, {
          layout: function (this: View) {
            for (const c of this.children) {
              c.x = 0;
              c.y = 0;
              c.w = this.w - 0 * 2;
              c.h = this.h - 0 * 2;
            }
          }
        },
          this.#iconArea,
          this.#windowArea,
        ),
        this.#taskbar,
      )
    ];

    sys.layoutTree();
  }

  newPanel(config: Partial<Panel>) {
    const $ = this.sys.make.bind(this.sys);
    const panel = $(Panel, config)
    this.#windowArea.addChild(panel);
    return panel;
  }


  addProgram(title: string, launch: (ws: Workspace) => void) {
    const $ = this.sys.make.bind(this.sys);
    this.#iconArea.addChild($(Button, {
      padding: 2,
      onClick: () => {
        launch(this);
        this.sys.layoutTree();
      },
    }, $(Label, { text: title })));
    this.sys.layoutTree();
  }

}
