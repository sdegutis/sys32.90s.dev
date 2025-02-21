import { Group } from "../sys32/containers/group.js";
import { Button, wrapButton } from "../sys32/controls/button.js";
import { Checkbox } from "../sys32/controls/checkbox.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { Panel } from "../sys32/core/panel.js";

export default function demo(panel: Panel) {
  const b = panel.make.bind(panel);

  const group1 = new RadioGroup();
  const group2 = new RadioGroup();

  return b(Group, { padding: 1, gap: 2, background: 0x0000ff33 },

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, b(RadioButton, { group: group1, size: 2, padding: 2 }), b(Label, { text: 'aaa' })),
      b(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, b(RadioButton, { group: group1, size: 2, padding: 2 }), b(Label, { text: 'bbb' })),
      b(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, b(RadioButton, { group: group1, size: 2, padding: 2 }), b(Label, { text: 'ccc' })),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, b(RadioButton, { group: group2, size: 2, padding: 0 }), b(Label, { text: 'aaa' })),
      b(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, b(RadioButton, { group: group2, size: 2, padding: 0 }), b(Label, { text: 'bbb' })),
      b(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, b(RadioButton, { group: group2, size: 2, padding: 0 }), b(Label, { text: 'ccc' })),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(TextField, { text: 'hi', background: 0x000000ff, padding: 0, length: 4 }),
      b(TextField, { text: 'hi', background: 0x000000ff, padding: 1, length: 4 }),
      b(TextField, { text: 'hi', background: 0x000000ff, padding: 2, length: 4 }),
      b(TextField, { text: 'hi', background: 0x000099ff, padding: 2, length: 4, cursorColor: 0xff000099, color: 0xffff00ff }),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Checkbox, { checked: true, padding: 0, size: 4 }),
      b(Checkbox, { checked: true, padding: 1, size: 4 }),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { dir: 'y', gap: 1 },
        b(Label, { text: 'hello', background: 0x00000077, padding: 3 }),
        b(Button, { onClick: () => { console.log('button') } },
          b(Label, { text: 'hello', background: 0x00000077, padding: 3 })
        ),
      ),
      b(Group, { dir: 'y', gap: 1 },
        b(Label, { text: 'hello', background: 0x00000077, padding: 3 }),
        b(Button, { onClick: () => { console.log('button') } },
          b(Label, { text: 'hello', background: 0x00000077, padding: 3 })
        ),
      ),
    ),

    b(Checkbox, { checked: true, }),

    b(Group, { dir: 'y', gap: 1 },
      b(Checkbox, { checked: true, padding: 0 }),
      b(Checkbox, { checked: true, padding: 1 }),
      b(Checkbox, { checked: true, padding: 2 }),
      b(Checkbox, { checked: true, padding: 3 }),
      b(Checkbox, { checked: true, padding: 4 }),
      b(Checkbox, { checked: true, padding: 5 }),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(ImageView, {
        image: new Bitmap([0x00000099, 0xffffffff], 3, [
          1, 1, 1,
          1, 2, 1,
          1, 2, 1,
          1, 2, 1,
          1, 1, 1,
        ])
      }),
      b(ImageView, {
        image: new Bitmap([0x00000099, 0xffffffff], 5, [
          1, 1, 1, 1, 1,
          1, 2, 2, 2, 1,
          1, 1, 1, 1, 1,
        ])
      }),
      b(ImageView, {
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

    b(Group, { dir: 'y', gap: 1 },
      b(Checkbox, { checked: true, size: 0, padding: 2, checkColor: 0x990000ff }),
      b(Checkbox, { checked: true, size: 1, padding: 2, checkColor: 0x990000ff }),
      b(Checkbox, { checked: true, size: 2, padding: 2, checkColor: 0x990000ff }),
      b(Checkbox, { checked: true, size: 3, padding: 2, checkColor: 0x990000ff }),
      b(Checkbox, { checked: true, size: 4, padding: 2, checkColor: 0x990000ff }),
      b(Checkbox, { checked: true, size: 5, padding: 2, checkColor: 0x990000ff }),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Checkbox, { checked: true, size: 0 }),
      b(Checkbox, { checked: true, size: 1 }),
      b(Checkbox, { checked: true, size: 2 }),
      b(Checkbox, { checked: true, size: 3 }),
      b(Checkbox, { checked: true, size: 4 }),
      b(Checkbox, { checked: true, size: 5, mouse: { x: 0, y: 0, cursor: { bitmap: new Bitmap([0x0000ffff], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]), offset: [0, 0] } } }),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { gap: 2, ...wrapButton(view => view.firstChild!), },
        b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
        b(Label, { text: 'foo' }),
      ),

      b(Group, { gap: 2, ...wrapButton(view => view.lastChild!), },
        b(Label, { text: 'bar' }),
        b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
      ),
    ),


  );
}