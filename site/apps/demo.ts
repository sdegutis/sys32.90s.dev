import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { makeButton } from "../sys32/controls/button.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { Slider } from "../sys32/controls/slider.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { multiplex, Reactive } from "../sys32/util/events.js";
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
  panel.focus();
};

export function demo(sys: System) {
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
    sys.make(GroupX, { align: 'n', gap: 4, background: 0x0000ff33 },

      sys.make(GroupY, { gap: 2 },
        makeDemoCheckmark('aaa'),
        makeDemoCheckmark('bbb', true),
        makeDemoCheckmark('ccc'),
      ),

      sys.make(GroupY, { gap: 1 },
        sys.make(Border, { background: 0x000000ff, all: 0, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000000ff, all: 1, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000000ff, all: 2, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, { background: 0x000099ff, all: 2, ...passedFocus }, sys.make(TextField, { text: 'hi', length: 4, cursorColor: 0xff000099, color: 0xffff00ff })),
      ),

      sys.make(GroupY, { gap: 1 },
        sys.make(GroupY, { gap: 1 },
          sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' })),
          (() => {
            const button = makeButton(() => { console.log('clicked button1') });
            return sys.make(Border, { ...button.all, background: 0x00000077, all: 3 },
              sys.make(Label, { text: 'hello' })
            )
          })(),
        ),
        sys.make(GroupY, { gap: 1 },
          sys.make(Border, { background: 0x00000077, all: 3 }, sys.make(Label, { text: 'hello' })),
          (() => {
            const button = makeButton(() => { console.log('clicked button2') });
            return sys.make(Border, { ...button.all, background: 0x00000077, all: 3 },
              sys.make(Label, { text: 'hello' })
            )
          })(),
        ),
      ),

      sys.make(GroupY, { gap: 1 },
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
