import { Group } from "../containers/group.js";
import { View } from "../core/view.js";
import { Reactive } from "../util/events.js";

class ClickCounter {

  count = 0;
  #clear!: ReturnType<typeof setTimeout>;
  #sec: number;

  constructor(sec = 333) {
    this.#sec = sec;
  }

  increase() {
    this.count++;
    clearTimeout(this.#clear);
    this.#clear = setTimeout(() => this.count = 0, this.#sec);
  }

}

export class Button extends Group {

  pressed = false;
  #counter = new ClickCounter();

  onClick?(count: number): void;

  override onMouseDown(): void {
    this.pressed = true;
    this.#counter.increase();
    const cancel = this.sys.trackMouse({
      move: () => { if (!this.hovered) { this.pressed = false; cancel() }; },
      up: () => { this.pressed = false; this.onClick?.(this.#counter.count) },
    });
  }

}

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
