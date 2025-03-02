import { Border } from "../containers/border.js";
import { Group } from "../containers/group.js";
import { PanedYB } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { makeFlowLayout, makeVacuumLayout } from "../util/layouts.js";
import { Clock } from "./clock.js";
import { Panel } from "./panel.js";

class Workspace {

  #icons!: View;
  #desktop!: View;
  #taskbar!: View;
  #panels!: View;

  init() {

    let big = false;

    sys.root.layout = makeVacuumLayout();

    this.#icons = $(View, {
      background: 0x222222ff,
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
        $(Border, { all: 2 }, $(Clock, {})),
        $(Button, {
          all: 2,
          background: 0x222222ff,
          onClick: () => {
            big = !big;
            sys.resize(320 * (+big + 1), 180 * (+big + 1));
            sys.layoutTree();
          }
        },
          $(Label, { text: 'resize' })
        )
      ),
    );

    sys.root.children = [
      $(PanedYB, {},
        this.#desktop,
        this.#taskbar
      )
    ];

    sys.layoutTree();
  }

  addPanel(panel: Panel) {
    if (this.#desktop.children.includes(panel)) return;

    panel.x = 20;
    panel.y = 20;

    this.#desktop.addChild(panel);

    const label = $(Label, {});
    const button = $(Button, {
      all: 2,
      background: 0x440000ff,
      onClick: () => {
        panel.show();
        panel.focus();
      }
    },
      label
    );
    this.#panels.addChild(button);
    this.#panels.layoutTree();

    panel.$data.title.watch(s => label.text = s);
    label.$data.text.watch(s => { this.#panels.layoutTree(); });

    panel.didClose.watch(() => {
      button.parent?.removeChild(button);
      this.#panels.layoutTree();
      this.#desktop.children.at(-1)?.focus();
    });

    panel.focus();
    sys.layoutTree();
  }

  async addProgram(name: string, path: string) {
    const mod = await import(path + path.split('/').at(-2) + '.js');
    const launch: () => void = mod.default;

    this.#programs.set(name, launch);

    this.#icons.addChild($(Button, { all: 2, onClick: () => launch() },
      $(Label, { text: name })
    ));
    sys.layoutTree();
  }

  launch(name: string, path?: string) {
    this.#programs.get(name)?.(path);
  }

  openFile(path: string) {
    const progs: Record<string, string> = {
      bitmap: 'painter',
      font: 'fontmaker',
    };
    const ext = path.split('.').at(-1);
    const prog = ext && progs[ext];

    if (prog) {
      this.launch(prog, path);
    }
  }

  #programs = new Map<string, (string?: string) => void>();

}

export const ws = new Workspace();
