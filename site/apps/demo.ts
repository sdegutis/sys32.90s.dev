import { Border } from "../sys32/containers/border.js";
import { Group, GroupX, GroupY } from "../sys32/containers/group.js";
import { makeButton } from "../sys32/controls/button.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { RadioGroup } from "../sys32/controls/radio.js";
import { Slider } from "../sys32/controls/slider.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { multiplex, Reactable } from "../sys32/util/events.js";
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

  const COLORS = [
    0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
    0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
    0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
    0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
  ];

  const main = sys.make(Border, { all: 2, borderColor: 0x0000ff33 },
    sys.make(GroupX, { gap: 4, background: 0x0000ff33 },

      (() => {
        const currentColor = new Reactable(COLORS[3]);

        const radios = COLORS.map(c => {
          const button = makeButton(() => { currentColor.val = c; });
          const selected = currentColor.adapt(n => n === c).reactive;
          const colorView = sys.make(View, { passthrough: true, background: c, w: 4, h: 4 });
          const border = sys.make(Border, { borderColor: 0xffffff33, all: 1, ...button.mouse }, colorView);

          border.useDataSource('borderColor', multiplex({
            selected: selected,
            hovered: button.hovered,
            pressed: button.pressed,
          }).adapt<number>(data => {
            if (data.selected) return 0xffffffff;
            if (data.pressed) return 0xffffff11;
            if (data.hovered) return 0xffffff22;
            return 0;
          }).reactive);

          return border;
        });

        return sys.make(GroupY, { gap: -1 }, ...radios);
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
        sys.make(Border, { background: 0x000000ff, all: 0, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000000ff, all: 1, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000000ff, all: 2, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000099ff, all: 2, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4, cursorColor: 0xff000099, color: 0xffff00ff })),
      ),

      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(Group, { dir: 'y', gap: 1 },
          sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' })),
          (() => {
            const button = makeButton(() => { console.log('clicked button1') });
            return sys.make(Border, { ...button.all, background: 0x00000077, all: 3 },
              sys.make(Label, { text: 'hello' })
            )
          })(),
        ),
        sys.make(Group, { dir: 'y', gap: 1 },
          sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' })),
          (() => {
            const button = makeButton(() => { console.log('clicked button2') });
            return sys.make(Border, { ...button.all, background: 0x00000077, all: 3 },
              sys.make(Label, { text: 'hello' })
            )
          })(),
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
