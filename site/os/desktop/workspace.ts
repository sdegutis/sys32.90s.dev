import { Border } from "../containers/border.js";
import { Group, GroupX } from "../containers/group.js";
import { PanedYB } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { Panel } from "../core/panel.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { makeFlowLayout, makeVacuumLayout } from "../util/layouts.js";
import { showMenu, type MenuItem } from "../util/menu.js";
import { Clock } from "./clock.js";

let big = false;

class Workspace {

  private desktop!: View;
  private taskbar!: View;
  private progbuttons!: View;

  init() {

    sys.root.layout = makeVacuumLayout();

    this.desktop = $(View, {
      background: 0x222222ff
    });

    const progMenuButton = $(Button, {
      padding: 2,
      background: 0x222222ff,
      onClick: () => this.showProgMenu(),
    }, $(Label, { text: 'run' }));

    this.progbuttons = $(GroupX, { gap: 1 },
      progMenuButton
    );

    this.taskbar = $(Spaced, { background: 0x000000ff },
      this.progbuttons,
      $(Border, { padding: 2 }, $(Clock, {})),
    );

    sys.root.children = [
      $(PanedYB, {},
        this.desktop,
        this.taskbar
      )
    ];

    sys.layoutTree();
  }

  addPanel(panel: Panel) {
    if (this.desktop.children.includes(panel)) return;

    const topPanel = this.desktop.children.at(-1);

    panel.x = (topPanel?.x ?? 0) + 12;
    panel.y = (topPanel?.y ?? 0) + 12;

    this.desktop.addChild(panel);

    const label = $(Label, {});
    const button = $(Button, {
      padding: 2,
      background: 0x440000ff,
      onClick: () => {
        panel.show();
        panel.focus();
      }
    },
      label
    );
    this.progbuttons.addChild(button);
    this.progbuttons.layoutTree();

    panel.$data.title.watch(s => label.text = s);
    label.$data.text.watch(s => { this.progbuttons.layoutTree(); });

    panel.didClose.watch(() => {
      button.parent?.removeChild(button);
      this.progbuttons.layoutTree();
      this.desktop.children.at(-1)?.focus();
    });

    panel.$data.panelFocused.watch(is => {
      button.background = is ? 0x770000ff : 0x330000ff;
    });

    panel.focus();
    sys.layoutTree();
  }

  async addProgram(name: string, path: string) {
    const mod = await import(path + path.split('/').at(-2) + '.js');
    const launch: () => void = mod.default;
    this.programs.set(name, launch);
    sys.layoutTree();
  }

  launch(name: string, path?: string) {
    this.programs.get(name)?.(path);
  }

  toggleSize() {
    big = !big;
    sys.resize(320 * (+big + 1), 180 * (+big + 1));
    sys.layoutTree();
  }

  showProgMenu() {
    showMenu([
      ...this.programs.entries().map(([name, launch]) => {
        return { text: name, onClick: () => launch() } as MenuItem;
      }).toArray(),
      '-',
      { text: 'resize', onClick: () => this.toggleSize() },
    ], menu => {
      menu.x = 0;
      menu.y = this.taskbar.y - menu.h;
    });
  }

  openFile(path: string) {
    const progs: Record<string, string> = {
      bitmap: 'painter',
      font: 'fontmaker',
    };
    const ext = path.split('.').at(-1) as keyof typeof progs;
    const prog = ext in progs ? progs[ext] : 'writer';
    this.launch(prog, path);
  }

  private programs = new Map<string, (filename?: string) => void>();

}

export const ws = new Workspace();
