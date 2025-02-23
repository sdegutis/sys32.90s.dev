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

    let big = false;

    sys.root.layout = makeVacuumLayout();

    this.#icons = sys.make(View, {
      background: 0x330000ff,
      layout: makeFlowLayout(3, 10),
      adjust: function () {
        this.x = this.y = 0;
        this.w = this.parent!.w;
        this.h = this.parent!.h;
      }
    });

    this.#desktop = sys.make(View, {}, this.#icons);

    this.#panels = sys.make(Group, { gap: 2 });

    this.#taskbar = sys.make(Spaced, { background: 0x000000ff },
      this.#panels,
      sys.make(Group, {},
        sys.make(Clock, { padding: 2 }),
        sys.make(Button, {
          background: 0x222222ff,
          padding: 2,
          onClick: () => {
            big = !big;
            sys.resize(320 * (+big + 1), 180 * (+big + 1));
            sys.layoutTree();
          },
        }, sys.make(Label, { text: 'resize' }))
      ),
    );

    this.#stealPanels();
    sys.root.childrenChanged = () => this.#stealPanels();

    sys.root.children = [
      sys.make(Paned, { vacuum: 'b', dir: 'y' },
        this.#desktop,
        this.#taskbar
      )
    ];

    sys.layoutTree();
  }

  #stealPanels() {
    let did = false;
    let i = this.sys.root.children.length;
    while (i--) {
      const child = this.sys.root.children[i];
      if (child instanceof Panel) {
        this.sys.root.removeChild(child);
        this.#addPanel(child);
        did = true;
      }
    }
    if (did) this.sys.layoutTree();
  }

  #addPanel(panel: Panel) {
    panel.x = 20;
    panel.y = 20;

    this.#desktop.addChild(panel);

    const button = this.sys.make(Button, {}, this.sys.make(Label, { padding: 2, text: panel.title }));
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

  addProgram(title: string, launch: (sys: System) => void) {
    this.#icons.addChild(this.sys.make(Button, {
      padding: 2,
      onClick: () => {
        launch(this.sys);
        // this.sys.layoutTree();
      },
    }, this.sys.make(Label, { text: title })));
    this.sys.layoutTree();
  }

}
