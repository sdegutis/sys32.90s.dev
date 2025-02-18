import { BorderBox, MouseTracker } from "./box.js";

export class Button extends BorderBox {

  padding = 1;
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
