import { View } from "../core/view.js";

export class Button extends View {

  padding = 0;

  hoverColor = 0xffffff22;
  pressColor = 0xffffff11;

  onClick?(): void;

  pressed = false;
  hovered = false;

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
    super.draw?.();
    if (this.pressed) {
      this.sys.rectFill(0, 0, this.w, this.h, this.pressColor);
    }
    else if (this.hovered) {
      this.sys.rectFill(0, 0, this.w, this.h, this.hoverColor);
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
