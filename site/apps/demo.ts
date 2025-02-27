import { Border } from "../sys32/containers/border.js";
import { GroupX, GroupY } from "../sys32/containers/group.js";
import { Button, makeButton } from "../sys32/controls/button.js";
import { ImageView } from "../sys32/controls/image.js";
import { Label } from "../sys32/controls/label.js";
import { TextField } from "../sys32/controls/textfield.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { Reactive } from "../sys32/util/events.js";
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

  const $ = sys.make.bind(sys);

  const radios = new Reactive(3);

  const main = $(Border, { all: 2, borderColor: 0x0000ff33 },
    $(GroupX, { align: 'n', gap: 4, background: 0x0000ff33 },

      $(GroupY, { gap: 2 },

        $(Button, {
          init(this: Button) { this.find('checkbox')!.addChild(this.overlay!); },
          onClick(this: Button) { radios.val = 0 }
        },
          $(GroupX, { gap: 2, },
            $(Label, { text: 'aaa' }),
            $(Border, { id: 'checkbox', borderColor: 0xffffff33, all: 1, },
              $(Border, { all: 1 },
                $(View, {
                  id: 'checkmark', passthrough: true, background: 0xffffffff, w: 2, h: 2,
                  init(this: View) { radios.watch(r => this.visible = r === 0) },
                })
              )
            ),
          )
        ),

        $(Button, {
          init(this: Button) { this.find('checkbox')!.addChild(this.overlay!); },
          onClick(this: Button) { radios.val = 1 }
        },
          $(GroupX, { gap: 2, },
            $(Border, { id: 'checkbox', borderColor: 0xffffff33, all: 1, },
              $(Border, { all: 1 },
                $(View, {
                  id: 'checkmark', passthrough: true, background: 0xffffffff, w: 2, h: 2,
                  init(this: View) { radios.watch(r => this.visible = r === 1) },
                })
              )
            ),
            $(Label, { text: 'bbb' }),
          )
        ),

        $(View, { h: 3 }),

        $(Button, {
          init(this: Button) { this.find('checkbox')!.addChild(this.overlay!); },
          onClick(this: Button) { this.find('checkmark')!.visible = !this.find('checkmark')!.visible }
        },
          $(GroupX, { gap: 2, },
            $(Label, { text: 'ccc' }),
            $(Border, { id: 'checkbox', borderColor: 0xffffff33, all: 1, },
              $(Border, { all: 1 },
                $(View, { id: 'checkmark', passthrough: true, background: 0xffffffff, w: 2, h: 2 })
              )
            ),
          )
        ),

        $(Button, {
          init(this: Button) { this.find('checkbox')!.addChild(this.overlay!); },
          onClick(this: Button) { this.find('checkmark')!.visible = !this.find('checkmark')!.visible }
        },
          $(GroupX, { gap: 2, },
            $(Border, { id: 'checkbox', borderColor: 0xffffff33, all: 1, },
              $(Border, { all: 1 },
                $(View, { id: 'checkmark', passthrough: true, background: 0xffffffff, w: 2, h: 2 })
              )
            ),
            $(Label, { text: 'ddd' }),
          )
        ),

      ),

      $(GroupY, { gap: 1 },
        $(Border, { background: 0x000000ff, all: 0, ...passedFocus }, $(TextField, { text: 'hi', length: 4 })),
        $(Border, { background: 0x000000ff, all: 1, ...passedFocus }, $(TextField, { text: 'hi', length: 4 })),
        $(Border, { background: 0x000000ff, all: 2, ...passedFocus }, $(TextField, { text: 'hi', length: 4 })),
        $(Border, { background: 0x000099ff, all: 2, ...passedFocus }, $(TextField, { text: 'hi', length: 4, cursorColor: 0xff000099, color: 0xffff00ff })),
      ),

      $(GroupY, { gap: 1 },
        $(GroupY, { gap: 1 },
          $(Border, { background: 0x00000077, all: 3 }, $(Label, { text: 'hello' })),
          $(Button, { onClick: (t) => { console.log('clicked button1', t); radios.val = 3 } },
            $(Border, { background: 0x00000077, all: 3 },
              $(Label, { text: 'hello' })
            )
          ),
        ),
        $(GroupY, { gap: 1 },
          $(Border, { background: 0x00000077, all: 3 }, $(Label, { text: 'hello' })),
          $(Button, { onClick: (t) => { console.log('clicked button2', t) } },
            $(Border, { background: 0x00000077, all: 3 },
              $(Label, { text: 'hello' })
            )
          ),
        ),
      ),

      $(GroupY, { gap: 1 },
        $(ImageView, { image: new Bitmap([0x00000099, 0xffffffff], 3, [1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1,]) }),
        $(ImageView, { image: new Bitmap([0x00000099, 0xffffffff], 5, [1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1,]) }),
        $(Border, { background: 0x00000033, all: 1, },
          $(ImageView, { image: new Bitmap([0xffffffff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,]) }),
        )
      ),


    )
  );

  return main;
}
