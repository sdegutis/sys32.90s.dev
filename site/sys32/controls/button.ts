import { View } from "../core/view.js";
import { Reactable } from "../util/events.js";

export class Button extends View {

  hoverColor = 0xffffff22;
  pressColor = 0xffffff11;

  onClick?(): void;

  pressed = false;
  hovered = false;

  override layout(): void {
    const c = this.firstChild;
    if (c) {
      c.x = 0;
      c.y = 0;
    }
  }

  override adjust(): void {
    const c = this.firstChild;
    if (c) {
      this.w = c.w;
      this.h = c.h;
    }
  }

  override onMouseDown(): void {
    this.pressed = true;
    const cancel = this.sys.trackMouse({
      move: () => {
        if (!this.hovered) {
          this.pressed = false;
          cancel();
        }
      },
      up: () => {
        this.pressed = false;
        this.onClick?.();
      },
    });
  }

  override draw(): void {
    super.draw();

    if (this.pressed) {
      this.sys.crt.rectFill(0, 0, this.w, this.h, this.pressColor);
    }
    else if (this.hovered) {
      this.sys.crt.rectFill(0, 0, this.w, this.h, this.hoverColor);
    }
  }

  override onMouseEnter(): void {
    super.onMouseEnter?.();
    this.hovered = true;
  }

  override onMouseExit(): void {
    super.onMouseExit?.();
    this.hovered = false;
  }

}

export function wrapButton(findButton: (view: View) => View) {
  return {
    onMouseEnter(this: View) { findButton(this).onMouseEnter?.() },
    onMouseExit(this: View) { findButton(this).onMouseExit?.() },
    onMouseDown(this: View) { findButton(this).onMouseDown?.() },
  };
}

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
