import { Border } from "../containers/border.js";
import { Group } from "../containers/group.js";
import { PanedYB } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { makeButton } from "../controls/button.js";
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
      background: 0x222222ff,
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
        sys.make(Border, { all: 2 }, sys.make(Clock, {})),
        sys.make(Border, {
          all: 2,
          background: 0x222222ff,
          ...makeButton(() => {
            big = !big;
            sys.resize(320 * (+big + 1), 180 * (+big + 1));
            sys.layoutTree();
          }).all
        },
          sys.make(Label, { text: 'resize' })
        )
      ),
    );

    this.#stealPanels();
    sys.root.childrenChanged = () => this.#stealPanels();

    sys.root.children = [
      sys.make(PanedYB, {},
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
        child.focus();
        did = true;
      }
    }
    if (did) this.sys.layoutTree();
  }

  #addPanel(panel: Panel) {
    panel.x = 20;
    panel.y = 20;

    this.#desktop.addChild(panel);

    const label = this.sys.make(Label, {});
    const button = this.sys.make(Border, {
      all: 2,
      background: 0x440000ff,
      ...makeButton(() => {
        panel.show();
        panel.focus();
      }).all
    },
      label
    );
    this.#panels.addChild(button);
    this.#panels.layoutTree();

    label.setDataSource('text', panel.getDataSource('title'));
    label.getDataSource('text').watch(s => {
      this.#panels.layoutTree();
    });

    panel.didClose.watch(() => {
      button.parent?.removeChild(button);
      this.#panels.layoutTree();
      this.#desktop.children.at(-1)?.focus();
    });

    return panel;
  }

  addProgram(title: string, launch: (sys: System) => void) {
    this.#icons.addChild(this.sys.make(Border, { all: 2, ...makeButton(() => launch(this.sys)).all },
      this.sys.make(Label, { text: title })
    ));
    this.sys.layoutTree();
  }

}
