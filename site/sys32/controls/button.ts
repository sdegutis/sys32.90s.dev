import { Border } from "../containers/border.js";
import { View } from "../core/view.js";
import { multiplex, Reactive } from "../util/events.js";

export class ClickCounter {

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

export class Button extends Border {

  pressed = false;
  #counter = new ClickCounter();

  hoverColor = 0xffffff22;
  pressColor = 0xffffff11;

  override passthrough = false;

  overlay = this.sys.make(View, {
    passthrough: true,
    layout() {
      if (!this.parent) return;
      this.x = this.y = 0;
      this.w = this.parent.w;
      this.h = this.parent.h;
    },
  });

  onClick?(count: number): void;

  override init(): void {
    this.addChild(this.overlay);
  }

  #changebg: Reactive<any> | undefined;

  override adopted(): void {
    this.#changebg = multiplex({
      pressed: this.getDataSource('pressed'),
      hovered: this.getDataSource('hovered'),
    });

    this.#changebg.watch(data => {
      let c = 0x00000000;
      if (data.pressed) c = this.pressColor;
      else if (data.hovered) c = this.hoverColor;
      this.overlay.background = c;
    });
  }

  override abandoned(): void {
    this.#changebg?.destroy();
    this.#changebg = undefined;
  }

  override onMouseDown(): void {
    this.pressed = true;
    this.#counter.increase();
    const cancel = this.sys.trackMouse({
      move: () => {
        if (!this.hovered) {
          this.pressed = false;
          cancel();
        };
      },
      up: () => {
        this.pressed = false;
        this.onClick?.(this.#counter.count);
      },
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
