import { Border } from "../containers/border.js";
import { GroupX } from "../containers/group.js";
import { PanedYB } from "../containers/paned.js";
import { Spaced } from "../containers/spaced.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { Panel } from "./panel.js";
import { sys } from "../core/system.js";
import { $, $data, View } from "../core/view.js";
import { makeVacuumLayout } from "../util/layouts.js";
import { showMenu, type MenuItem } from "../util/menu.js";
import { Clock } from "./clock.js";

class Workspace {

  private desktop = $(View, {
    background: 0x222222ff
  });

  private progbuttons = $(GroupX, { gap: 1 },
    $(Button, {
      padding: 2,
      background: 0x222222ff,
      onClick: () => this.showProgMenu(),
    }, $(Label, { text: 'run' }))
  );

  private taskbar = $(Spaced, { background: 0x000000ff },
    this.progbuttons,
    $(Border, { padding: 2 }, $(Clock, {})),
  );

  showDesktop() {
    sys.root.layout = makeVacuumLayout();
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
        sys.focus(panel);
      }
    },
      label
    );
    this.progbuttons.addChild(button);
    sys.layoutTree(this.progbuttons);

    $data(panel, 'title').watch(s => label.text = s);
    $data(label, 'text').watch(s => { sys.layoutTree(this.progbuttons); });

    panel.didClose.watch(() => {
      button.parent?.removeChild(button);
      sys.layoutTree(this.progbuttons);
      const lastPanel = this.desktop.children.at(-1);
      lastPanel && sys.focus(lastPanel);
    });

    $data(panel, 'panelFocused').watch(is => {
      button.background = is ? 0x770000ff : 0x330000ff;
    });

    sys.focus(panel);
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

  showProgMenu() {
    const progs = this.programs.entries().filter(p => p[0] !== 'settings');
    const settings = this.programs.get('settings')!;

    showMenu([
      ...progs.map(([name, launch]) => {
        return { text: name, onClick: () => launch() } as MenuItem;
      }).toArray(),
      '-',
      { text: 'settings', onClick: () => settings() },
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
