import { GroupX, GroupY } from "../sys32/containers/group.js";
import { PanedYB } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { TextField } from "../sys32/controls/textfield.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";

export default function paint(sys: System) {
  const widthLabel = sys.make(TextField, { length: 3, background: 0x000000ff, padding: 2 });
  const heightLabel = sys.make(TextField, { length: 3, background: 0x000000ff, padding: 2 });

  widthLabel.onChange = () => {

    console.log(widthLabel.text)
  }


  const panel = sys.make(Panel, {
    title: 'paint',
  },
    sys.make(PanedYB, {},
      sys.make(View, { background: 0x111111ff }),
      sys.make(GroupY, { background: 0x0000ff33 },
        sys.make(View, { h: 3, background: 0x00ff00ff }),
        sys.make(GroupX, {},

          sys.make(Label, { text: 'w:' }),
          widthLabel,

          sys.make(Label, { text: 'h:' }),
          heightLabel,

          sys.make(Button, {
            padding: 2,
            onClick: () => {
              console.log('hey')
            }
          }, sys.make(Label, { text: 'resize' }))
        ),
      )
    )
  )

  sys.root.addChild(panel);
  sys.focus(panel);
}
