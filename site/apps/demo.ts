import { Group } from "../sys32/containers/group.js";
import { Button, wrapButton } from "../sys32/controls/button.js";
import { Checkbox } from "../sys32/controls/checkbox.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { Workspace } from "../sys32/desktop/workspace.js";
import { centerLayout } from "../sys32/util/layouts.js";

export default (ws: Workspace) => {
  const panel = ws.sys.make(Panel, {
    title: 'demo',
    content: ws.sys.make(View, { layout: centerLayout, background: 0xffffff11 },
      demo(ws.sys)
    )
  })
  ws.addPanel(panel);
};

export function demo(sys: System) {
  const group1 = new RadioGroup();
  const group2 = new RadioGroup();

  const main = sys.make(Group, { padding: 1, gap: 2, background: 0x0000ff33 },

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, sys.make(RadioButton, { group: group1, size: 2, padding: 2 }), sys.make(Label, { text: 'aaa' })),
      sys.make(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, sys.make(RadioButton, { group: group1, size: 2, padding: 2 }), sys.make(Label, { text: 'bbb' })),
      sys.make(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, sys.make(RadioButton, { group: group1, size: 2, padding: 2 }), sys.make(Label, { text: 'ccc' })),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, sys.make(RadioButton, { group: group2, size: 2, padding: 0 }), sys.make(Label, { text: 'aaa' })),
      sys.make(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, sys.make(RadioButton, { group: group2, size: 2, padding: 0 }), sys.make(Label, { text: 'bbb' })),
      sys.make(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, sys.make(RadioButton, { group: group2, size: 2, padding: 0 }), sys.make(Label, { text: 'ccc' })),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(TextField, { text: 'hi', background: 0x000000ff, padding: 0, length: 4 }),
      sys.make(TextField, { text: 'hi', background: 0x000000ff, padding: 1, length: 4 }),
      sys.make(TextField, { text: 'hi', background: 0x000000ff, padding: 2, length: 4 }),
      sys.make(TextField, { text: 'hi', background: 0x000099ff, padding: 2, length: 4, cursorColor: 0xff000099, color: 0xffff00ff }),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Checkbox, { checked: true, padding: 0, size: 4 }),
      sys.make(Checkbox, { checked: true, padding: 1, size: 4 }),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(Label, { text: 'hello', background: 0x00000077, padding: 3 }),
        sys.make(Button, { onClick: () => { console.log('button') } },
          sys.make(Label, { text: 'hello', background: 0x00000077, padding: 3 })
        ),
      ),
      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(Label, { text: 'hello', background: 0x00000077, padding: 3 }),
        sys.make(Button, { onClick: () => { console.log('button') } },
          sys.make(Label, { text: 'hello', background: 0x00000077, padding: 3 })
        ),
      ),
    ),

    sys.make(Checkbox, { checked: true, }),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Checkbox, { checked: true, padding: 0 }),
      sys.make(Checkbox, { checked: true, padding: 1 }),
      sys.make(Checkbox, { checked: true, padding: 2 }),
      sys.make(Checkbox, { checked: true, padding: 3 }),
      sys.make(Checkbox, { checked: true, padding: 4 }),
      sys.make(Checkbox, { checked: true, padding: 5 }),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(ImageView, {
        image: new Bitmap([0x00000099, 0xffffffff], 3, [
          1, 1, 1,
          1, 2, 1,
          1, 2, 1,
          1, 2, 1,
          1, 1, 1,
        ])
      }),
      sys.make(ImageView, {
        image: new Bitmap([0x00000099, 0xffffffff], 5, [
          1, 1, 1, 1, 1,
          1, 2, 2, 2, 1,
          1, 1, 1, 1, 1,
        ])
      }),
      sys.make(ImageView, {
        background: 0x00000033,
        padding: 1,
        image: new Bitmap([0xffffffff], 4, [
          1, 0, 0, 1,
          0, 1, 1, 0,
          0, 1, 1, 0,
          1, 0, 0, 1,
        ])
      }),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Checkbox, { checked: true, size: 0, padding: 2, checkColor: 0x990000ff }),
      sys.make(Checkbox, { checked: true, size: 1, padding: 2, checkColor: 0x990000ff }),
      sys.make(Checkbox, { checked: true, size: 2, padding: 2, checkColor: 0x990000ff }),
      sys.make(Checkbox, { checked: true, size: 3, padding: 2, checkColor: 0x990000ff }),
      sys.make(Checkbox, { checked: true, size: 4, padding: 2, checkColor: 0x990000ff }),
      sys.make(Checkbox, { checked: true, size: 5, padding: 2, checkColor: 0x990000ff }),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Checkbox, { checked: true, size: 0 }),
      sys.make(Checkbox, { checked: true, size: 1 }),
      sys.make(Checkbox, { checked: true, size: 2 }),
      sys.make(Checkbox, { checked: true, size: 3 }),
      sys.make(Checkbox, { checked: true, size: 4 }),
      sys.make(Checkbox, { checked: true, size: 5, cursor: { bitmap: new Bitmap([0x0000ffff], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]), offset: [0, 0] } }),
    ),

    sys.make(Group, { dir: 'y', gap: 1 },
      sys.make(Group, { gap: 2, ...wrapButton(view => view.firstChild!), },
        sys.make(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
        sys.make(Label, { text: 'foo' }),
      ),

      sys.make(Group, { gap: 2, ...wrapButton(view => view.lastChild!), },
        sys.make(Label, { text: 'bar' }),
        sys.make(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
      ),
    ),


  );

  return main;
}
