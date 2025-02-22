import { Group, GroupX, GroupY } from "../sys32/containers/group.js";
import { Paned, PanedYA, PanedYB } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { View } from "../sys32/core/view.js";
import { Workspace } from "../sys32/desktop/workspace.js";

export default function paint(ws: Workspace) {

  const $ = ws.sys.make.bind(ws.sys);

  const panel = ws.newPanel({
    title: 'paint',
    content: $(PanedYB, {},
      $(View, { background: 0x111111ff }),
      $(GroupY, {},
        $(View, { h: 3, background: 0x00ff0033 }),
        $(GroupX, {},
          $(Button, {}, $(Label, { text: 'hey' }))
        ),
      )
    ),
  });


}
