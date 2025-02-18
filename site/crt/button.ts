import { BorderBox, Box, MouseTracker } from "./box.js";
import { make } from "./screen.js";

export class Button extends BorderBox {

  hoverColor = 0x00000033;
  pressColor = 0x00000077;

  onClick?(): void;

  #pressed = false;

  override layout(): void {
    this.children[0].x = this.padding;
    this.children[0].y = this.padding;
  }

  override adjust(): void {
    this.w = this.children[0].w + this.padding * 2;
    this.h = this.children[0].h + this.padding * 2;
  }

  override onMouseDown(trackMouse: MouseTracker): void {
    this.#pressed = true;
    trackMouse({
      move: () => {
        if (!this.hovered) {
          this.#pressed = false;
        }
      },
      up: () => {
        if (this.#pressed) {
          this.onClick?.();
        }
        this.#pressed = false;
      },
    });
  }

  override draw(): void {
    super.draw();
    if (this.#pressed) {
      this.screen.rectFill(0, 0, this.w, this.h, this.pressColor);
    }
    else if (this.hovered) {
      this.screen.rectFill(0, 0, this.w, this.h, this.hoverColor);
    }
  }

}

export class Checkbox extends Button {

  checked = false;
  onChange?() { }

  override children = [
    make(this.screen, Box, {
      w: 3, h: 3,
      background: 0xffffffff, passthrough: true,
      visible: false,
    })
  ];

  override onMouseDown(trackMouse: MouseTracker): void {
    super.onMouseDown(trackMouse);
    this.checked = !this.checked;
    this.children[0].visible = this.checked;
    this.onChange?.();
  }

}
