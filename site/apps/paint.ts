import { Group, GroupX, GroupY } from "../sys32/containers/group.js";
import { Paned, PanedYA, PanedYB } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { View } from "../sys32/core/view.js";
import { Workspace } from "../sys32/desktop/workspace.js";

export default function paint(ws: Workspace) {

  const panel = ws.newPanel({
    title: 'paint',
    content: ws.sys.make(PanedYB, {},
      ws.sys.make(View, { background: 0x111111ff }),
      ws.sys.make(GroupY, {},
        ws.sys.make(View, { h: 3, background: 0x00ff0033 }),
        ws.sys.make(GroupX, {},
          ws.sys.make(Button, {}, ws.sys.make(Label, { text: 'hey' }))
        ),
      )
    ),
  });

}
