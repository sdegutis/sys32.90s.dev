import { View } from "../core/view.js";
import { Reactable } from "../util/events.js";

export function makeButton(
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
        if (!hovered.val) {
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
    onMouseEnter,
    onMouseExit,
    onMouseDown,
    passthrough: false,
  };

  return {
    draw,
    mouse,
    all: { draw, ...mouse },
    pressed,
    hovered,
  };
}
