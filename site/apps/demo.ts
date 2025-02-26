import { Border } from "../sys32/containers/border.js";
import { Group, GroupX, GroupY } from "../sys32/containers/group.js";
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
import { centerLayout } from "../sys32/util/layouts.js";
import { Reactable } from "./paint.js";

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

class Checkbox2 extends View {

  visible2 = new Reactable(false);

  #stopWatching!: () => void;

  override passthrough = true;

  override adopted(): void {
    this.#stopWatching = this.visible2.watch(b => {
      this.sys.needsRedraw = true;
    });
  }

  override abandoned(): void {
    this.#stopWatching();
    this.#stopWatching = undefined!;
  }

  // override adjust(): void {
  //   this.w = this.h = 10;
  // }

  override draw(): void {
    if (this.visible2.val) {
      super.draw();
    }
  }

  // override onClick(): void {
  //   super.onClick?.();
  //   this.source.val = !this.source.val;
  // }

}

export function demo(sys: System) {
  const group1 = new RadioGroup();
  const group2 = new RadioGroup();

  const on = new Reactable(true);

  on.watch(b => console.log({ b }))

  function passFocus(config: Partial<Border>) {
    config.passthrough = false;
    config.onFocus = function () { this.firstChild?.focus(); };
    return config;
  }

  function makeButton(
    onClick: () => void,
    hoverColor = 0xffffff22,
    pressColor = 0xffffff11,
  ) {
    const pressed = new Reactable(false);
    const hovered = new Reactable(false);

    function draw(this: View) {
      (Object.getPrototypeOf(this) as View).draw.call(this);
      if (pressed.val) {
        this.sys.crt.rectFill(0, 0, this.w, this.h, pressColor);
      }
      else if (hovered.val) {
        this.sys.crt.rectFill(0, 0, this.w, this.h, hoverColor);
      }
    }

    const onMouseEnter = () => hovered.val = true;
    const onMouseExit = () => hovered.val = false;
    const onMouseDown = function (this: View) {
      pressed.val = true;
      const cancel = this.sys.trackMouse({
        move: () => {
          if (!hovered) {
            pressed.val = false;
            cancel();
          }
        },
        up: () => {
          pressed.val = false;
          onClick();
        },
      });
    };

    return {
      mouse: { onMouseEnter, onMouseExit, onMouseDown },
      draw
    };
  }

  const button = makeButton(() => { on.val = !on.val; });

  const main = sys.make(Border, { all: 2, borderColor: 0x0000ff33 },
    sys.make(Group, { gap: 2, background: 0x0000ff33 },

      sys.make(GroupX, { gap: 1, ...button.mouse },
        sys.make(Label, { text: 'hey' }),
        sys.make(Border, { borderColor: 0xffffff33, all: 1, draw: button.draw },
          sys.make(Border, { all: 1 },
            sys.make(Border, {},
              sys.make(Checkbox2, { visible2: on, background: 0xffffffff, w: 2, h: 2 })
            )
          ))
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
        sys.make(Border, passFocus({ background: 0x000000ff, all: 0 }), sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, passFocus({ background: 0x000000ff, all: 1 }), sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, passFocus({ background: 0x000000ff, all: 2 }), sys.make(TextField, { text: 'hi', length: 4 })),
        sys.make(Border, passFocus({ background: 0x000099ff, all: 2 }), sys.make(TextField, { text: 'hi', length: 4, cursorColor: 0xff000099, color: 0xffff00ff })),
      ),

      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(Checkbox, { checked: true, padding: 0, size: 4 }),
        sys.make(Checkbox, { checked: true, padding: 1, size: 4 }),
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
        sys.make(Border, {
          background: 0x00000033,
          all: 1,
        },
          sys.make(ImageView, {
            image: new Bitmap([0xffffffff], 4, [
              1, 0, 0, 1,
              0, 1, 1, 0,
              0, 1, 1, 0,
              1, 0, 0, 1,
            ])
          }),
        )
      ),

      sys.make(Group, { dir: 'y', gap: 1 },
        sys.make(Checkbox, { checked: true, size: 0, padding: 2, checkColorOn: 0x990000ff }),
        sys.make(Checkbox, { checked: true, size: 1, padding: 2, checkColorOn: 0x990000ff }),
        sys.make(Checkbox, { checked: true, size: 2, padding: 2, checkColorOn: 0x990000ff }),
        sys.make(Checkbox, { checked: true, size: 3, padding: 2, checkColorOn: 0x990000ff }),
        sys.make(Checkbox, { checked: true, size: 4, padding: 2, checkColorOn: 0x990000ff }),
        sys.make(Checkbox, { checked: true, size: 5, padding: 2, checkColorOn: 0x990000ff }),
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


    )
  );

  return main;
}
