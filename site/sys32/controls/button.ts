import { View } from "../core/view.js";
import { Reactive } from "../util/events.js";

export function makeButton(
  onClick: () => void,
  hoverColor = 0xffffff22,
  pressColor = 0xffffff11,
) {
  const pressed = new Reactive(false);

  function draw(this: View) {
    (Object.getPrototypeOf(this) as View).draw.call(this);
    if (pressed.val) {
      this.sys.crt.rectFill(0, 0, this.w, this.h, pressColor);
    }
    else if (this.hovered) {
      this.sys.crt.rectFill(0, 0, this.w, this.h, hoverColor);
    }
  }

  const onMouseDown = function (this: View) {
    pressed.val = true;
    const cancel = this.sys.trackMouse({
      move: () => {
        if (!this.hovered) {
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

  const mouse: Partial<View> = {
    onMouseDown,
    passthrough: false,
  };

  return {
    draw,
    mouse,
    all: { draw, ...mouse },
    pressed,
  };
}
