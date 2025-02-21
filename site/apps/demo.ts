import { Group } from "../sys32/containers/group.js";
import { Button, wrapButton } from "../sys32/controls/button.js";
import { Checkbox } from "../sys32/controls/checkbox.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";

export default function demo(sys: System) {
  const $ = sys.make.bind(sys);

  const group1 = new RadioGroup();
  const group2 = new RadioGroup();

  return $(Group, { padding: 1, gap: 2, background: 0x0000ff33 },

    $(Group, { dir: 'y', gap: 1 },
      $(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, $(RadioButton, { group: group1, size: 2, padding: 2 }), $(Label, { text: 'aaa' })),
      $(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, $(RadioButton, { group: group1, size: 2, padding: 2 }), $(Label, { text: 'bbb' })),
      $(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, $(RadioButton, { group: group1, size: 2, padding: 2 }), $(Label, { text: 'ccc' })),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, $(RadioButton, { group: group2, size: 2, padding: 0 }), $(Label, { text: 'aaa' })),
      $(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, $(RadioButton, { group: group2, size: 2, padding: 0 }), $(Label, { text: 'bbb' })),
      $(Group, { gap: 1, ...wrapButton(view => view.firstChild!) }, $(RadioButton, { group: group2, size: 2, padding: 0 }), $(Label, { text: 'ccc' })),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(TextField, { text: 'hi', background: 0x000000ff, padding: 0, length: 4 }),
      $(TextField, { text: 'hi', background: 0x000000ff, padding: 1, length: 4 }),
      $(TextField, { text: 'hi', background: 0x000000ff, padding: 2, length: 4 }),
      $(TextField, { text: 'hi', background: 0x000099ff, padding: 2, length: 4, cursorColor: 0xff000099, color: 0xffff00ff }),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(Checkbox, { checked: true, padding: 0, size: 4 }),
      $(Checkbox, { checked: true, padding: 1, size: 4 }),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(Group, { dir: 'y', gap: 1 },
        $(Label, { text: 'hello', background: 0x00000077, padding: 3 }),
        $(Button, { onClick: () => { console.log('button') } },
          $(Label, { text: 'hello', background: 0x00000077, padding: 3 })
        ),
      ),
      $(Group, { dir: 'y', gap: 1 },
        $(Label, { text: 'hello', background: 0x00000077, padding: 3 }),
        $(Button, { onClick: () => { console.log('button') } },
          $(Label, { text: 'hello', background: 0x00000077, padding: 3 })
        ),
      ),
    ),

    $(Checkbox, { checked: true, }),

    $(Group, { dir: 'y', gap: 1 },
      $(Checkbox, { checked: true, padding: 0 }),
      $(Checkbox, { checked: true, padding: 1 }),
      $(Checkbox, { checked: true, padding: 2 }),
      $(Checkbox, { checked: true, padding: 3 }),
      $(Checkbox, { checked: true, padding: 4 }),
      $(Checkbox, { checked: true, padding: 5 }),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(ImageView, {
        image: new Bitmap([0x00000099, 0xffffffff], 3, [
          1, 1, 1,
          1, 2, 1,
          1, 2, 1,
          1, 2, 1,
          1, 1, 1,
        ])
      }),
      $(ImageView, {
        image: new Bitmap([0x00000099, 0xffffffff], 5, [
          1, 1, 1, 1, 1,
          1, 2, 2, 2, 1,
          1, 1, 1, 1, 1,
        ])
      }),
      $(ImageView, {
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

    $(Group, { dir: 'y', gap: 1 },
      $(Checkbox, { checked: true, size: 0, padding: 2, checkColor: 0x990000ff }),
      $(Checkbox, { checked: true, size: 1, padding: 2, checkColor: 0x990000ff }),
      $(Checkbox, { checked: true, size: 2, padding: 2, checkColor: 0x990000ff }),
      $(Checkbox, { checked: true, size: 3, padding: 2, checkColor: 0x990000ff }),
      $(Checkbox, { checked: true, size: 4, padding: 2, checkColor: 0x990000ff }),
      $(Checkbox, { checked: true, size: 5, padding: 2, checkColor: 0x990000ff }),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(Checkbox, { checked: true, size: 0 }),
      $(Checkbox, { checked: true, size: 1 }),
      $(Checkbox, { checked: true, size: 2 }),
      $(Checkbox, { checked: true, size: 3 }),
      $(Checkbox, { checked: true, size: 4 }),
      $(Checkbox, { checked: true, size: 5, mouse: { x: 0, y: 0, cursor: { bitmap: new Bitmap([0x0000ffff], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]), offset: [0, 0] } } }),
    ),

    $(Group, { dir: 'y', gap: 1 },
      $(Group, { gap: 2, ...wrapButton(view => view.firstChild!), },
        $(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
        $(Label, { text: 'foo' }),
      ),

      $(Group, { gap: 2, ...wrapButton(view => view.lastChild!), },
        $(Label, { text: 'bar' }),
        $(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
      ),
    ),


  );
}