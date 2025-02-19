import { BorderBox, MouseTracker } from "./box.js";

export class Button extends BorderBox {

  hoverColor = 0xffffff22;
  pressColor = 0xffffff11;

  onClick?(): void;

  pressed = false;

  override layout(): void {
    const c = this.children[0];
    if (c) {
      c.x = this.padding;
      c.y = this.padding;
    }
  }

  override adjust(): void {
    const c = this.children[0];
    if (c) {
      this.w = c.w + this.padding * 2;
      this.h = c.h + this.padding * 2;
    }
  }

  override onMouseDown(trackMouse: MouseTracker): void {
    this.pressed = true;
    trackMouse({
      move: () => {
        if (!this.hovered) {
          this.pressed = false;
        }
      },
      up: () => {
        if (this.pressed) {
          this.onClick?.();
        }
        this.pressed = false;
      },
    });
  }

  override draw(): void {
    super.draw();
    if (this.pressed) {
      this.screen.rectFill(0, 0, this.w, this.h, this.pressColor);
    }
    else if (this.hovered) {
      this.screen.rectFill(0, 0, this.w, this.h, this.hoverColor);
    }
  }

}
