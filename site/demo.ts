import { Button } from "./sys32/button.js";
import { Checkbox } from "./sys32/checkbox.js";
import { Group } from "./sys32/group.js";
import { Label, wrapButton } from "./sys32/label.js";
import { RadioButton, RadioGroup } from "./sys32/radio.js";
import { makeBuilder, type System } from "./sys32/system.js";

export function demo(sys: System) {
  const b = makeBuilder(sys);

  const group1 = new RadioGroup();
  const group2 = new RadioGroup();

  return b(Group, { padding: 1, gap: 2, background: 0xffffff33 },

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { gap: 1, ...wrapButton(box => box.firstChild) }, b(RadioButton, { group: group1, size: 2, padding: 2 }), b(Label, { text: 'aaa' })),
      b(Group, { gap: 1, ...wrapButton(box => box.firstChild) }, b(RadioButton, { group: group1, size: 2, padding: 2 }), b(Label, { text: 'bbb' })),
      b(Group, { gap: 1, ...wrapButton(box => box.firstChild) }, b(RadioButton, { group: group1, size: 2, padding: 2 }), b(Label, { text: 'ccc' })),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { gap: 1, ...wrapButton(box => box.firstChild) }, b(RadioButton, { group: group2, size: 2, padding: 0 }), b(Label, { text: 'aaa' })),
      b(Group, { gap: 1, ...wrapButton(box => box.firstChild) }, b(RadioButton, { group: group2, size: 2, padding: 0 }), b(Label, { text: 'bbb' })),
      b(Group, { gap: 1, ...wrapButton(box => box.firstChild) }, b(RadioButton, { group: group2, size: 2, padding: 0 }), b(Label, { text: 'ccc' })),
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
      b(Checkbox, { checked: true, size: 5 }),
    ),

    b(Group, { dir: 'y', gap: 1 },
      b(Group, { gap: 2, ...wrapButton(box => box.firstChild), },
        b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
        b(Label, { text: 'foo' }),
      ),

      b(Group, { gap: 2, ...wrapButton(box => box.lastChild), },
        b(Label, { text: 'bar' }),
        b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
      ),
    ),


  );
}