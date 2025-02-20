import { Group, Spaced } from "../containers/group.js";
import { Paned } from "../containers/paned.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { System } from "../core/system.js";
import { View } from "../core/view.js";
import { makeBuilder } from "../util/build.js";

export class Workspace {

  desktop;
  taskbar;

  constructor(public sys: System) {
    const b = makeBuilder(sys);
    this.desktop = b(View, { background: 0x333333ff });
    this.taskbar = b(Spaced, { background: 0x000000ff },
      b(Group, { background: 0x222222ff },
        b(Button, { padding: 2 }, b(Label, { text: 'one' }))
      ),
      b(Group, { background: 0x222222ff },
      )
    );

    sys.root.children = [
      b(Paned, { vacuum: 'b', dir: 'y' },
        this.desktop,
        this.taskbar,
      )
    ];

    sys.layoutTree();
  }

}
