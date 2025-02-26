import { Border } from "../sys32/containers/border.js";
import { Group, GroupX, GroupY } from "../sys32/containers/group.js";
import { Button, makeButton, wrapButton } from "../sys32/controls/button.js";
import { Checkbox } from "../sys32/controls/checkbox.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { Slider } from "../sys32/controls/slider.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { Reactable } from "../sys32/util/events.js";
import { centerLayout } from "../sys32/util/layouts.js";
import { passedFocus } from "../sys32/util/unsure.js";

export default (sys: System) => {
  const panel = sys.make(Panel, {
    title: 'demo',
  },
    sys.make(View, { layout: centerLayout, background: 0xffffff11 },
      demo(sys)
    )
  )
  sys.root.addChild(panel);
  sys.focus(panel);
};

export function demo(sys: System) {
  const group1 = new RadioGroup();
  const group2 = new RadioGroup();

  const on = new Reactable(true);
  on.watch(b => console.log({ b }))
  // setInterval(() => { on.val = !on.val; }, 1000);
  const button = makeButton(() => { on.val = !on.val; });

  function digInto<T>(t: T, fn: (t: T) => void) {
    fn(t);
    return t;
  }

  const zoom = new Reactable(3);
  zoom.watch(n => main.parent?.layoutTree(), false)

  const zoom2 = zoom.adapt(n => n * 2);
  zoom2.reactive.watch(n => main.parent?.layoutTree(), false)

  setTimeout(() => {
    zoom2.disconnect();
  }, 1000);

  function makeDemoCheckmark(text: string, reverse = false) {
    let checkmark: View;
    const button = makeButton(() => { checkmark.visible = !checkmark.visible; });
    const group = sys.make(GroupX, { gap: 2, ...button.mouse },
      sys.make(Border, { borderColor: 0xffffff33, all: 1, draw: button.draw },
        sys.make(Border, { all: 1 },
          checkmark = sys.make(View, { passthrough: true, background: 0xffffffff, w: 2, h: 2 })
        )
      ),
      sys.make(Label, { text })
    );
    if (reverse) {
      const child = group.children[0];
      child.remove();
      group.addChild(child);
    }
    return group;
  }

  const main = sys.make(Border, { all: 2, borderColor: 0x0000ff33 },
    sys.make(Group, { gap: 2, background: 0x0000ff33 },

      (() => {
        const on = new Reactable(true);
        const button = makeButton(() => { on.val = !on.val; });
        let checkmark;
        const group = sys.make(GroupX, { gap: 2, ...button.mouse },
          sys.make(Border, { borderColor: 0xffffff33, all: 1, draw: button.draw },
            sys.make(Border, { all: 1 },
              checkmark = sys.make(View, { passthrough: true, background: 0xffffffff, w: 2, h: 2 })
            )
          ),
          sys.make(Label, { text: 'radio' }),
        );
        checkmark.useDataSource('visible', on);
        return group;
      })(),

      sys.make(GroupY, { gap: 2 },
        makeDemoCheckmark('aaa'),
        makeDemoCheckmark('bbb', true),
        makeDemoCheckmark('ccc'),
      ),

      sys.make(GroupY, { gap: 4 },

        digInto(sys.make(Slider, { knobSize: 3, w: 20, val: 3, min: 2, max: 7 }), slider => {
          slider.useDataSource('val', zoom);
        }),

        sys.make(GroupX, { gap: 1, ...button.mouse },
          digInto(sys.make(Border, { borderColor: 0xffffff33, all: 1, draw: button.draw },
            sys.make(Border, { all: 1 },
              sys.make(Border, {},
                digInto(sys.make(View, { passthrough: true, background: 0xffffffff, }), view => {
                  view.useDataSource('w', zoom2.reactive);
                  view.useDataSource('h', zoom);
                  view.useDataSource('visible', on);
                })
              )
            )
          ), border => {
            border.useDataSource('r', zoom);
          }),
          digInto(sys.make(Label, { text: 'hey' }), label => {
            const r = zoom2.reactive.adapt(n => n.toString()).reactive;
            label.useDataSource('text', r)
          }),
        ),

        digInto(sys.make(Slider, { knobSize: 3, w: 20, val: 3, min: 2, max: 7 }), slider => {
          slider.useDataSource('val', zoom);
        }),

        sys.make(GroupX, { gap: 1, ...button.mouse },
          digInto(sys.make(Border, { borderColor: 0xffffff33, all: 1, draw: button.draw },
            sys.make(Border, { all: 1 },
              sys.make(Border, {},
                digInto(sys.make(View, { passthrough: true, background: 0xffffffff, }), view => {
                  view.useDataSource('w', zoom2.reactive);
                  view.useDataSource('h', zoom);
                  view.useDataSource('visible', on);
                })
              )
            )
          ), border => {
            border.useDataSource('r', zoom);
          }),
          digInto(sys.make(Label, { text: 'hey' }), label => {
            const r = zoom2.reactive.adapt(n => n.toString()).reactive;
            label.useDataSource('text', r)
          }),
        ),

      ),

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
        sys.make(Border, { background: 0x000000ff, all: 0, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000000ff, all: 1, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000000ff, all: 2, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000099ff, all: 2, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4, cursorColor: 0xff000099, color: 0xffff00ff })),
      ),

      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(Group, { dir: 'y', gap: 1 },
          sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' })),
          sys.make(Button, { onClick: () => { console.log('button') } },
            sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' }))
          ),
        ),
        sys.make(Group, { dir: 'y', gap: 1 },
          sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' })),
          sys.make(Button, { onClick: () => { console.log('button') } },
            sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' }))
          ),
        ),
      ),

      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(ImageView, { image: new Bitmap([0x00000099, 0xffffffff], 3, [1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1,]) }),
        sys.make(ImageView, { image: new Bitmap([0x00000099, 0xffffffff], 5, [1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1,]) }),
        sys.make(Border, { background: 0x00000033, all: 1, },
          sys.make(ImageView, { image: new Bitmap([0xffffffff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,]) }),
        )
      ),


    )
  );

  return main;
}
