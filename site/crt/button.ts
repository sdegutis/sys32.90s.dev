import { BorderBox, Box, MouseTracker } from "./box.js";
import { Label } from "./label.js";

export class Button extends BorderBox {

  padding = 1;
  hoverColor = 0x00000033;
  pressColor = 0x00000077;

  onClick?(): void;

  #pressed = false;

  override children: Box[] = [new Label(this.screen, 'button')];

  get child() { return this.children[0]; }
  set child(child: Box) {
    this.children = [child];
    child.x = this.padding;
    child.y = this.padding;
    this.w = child.w + this.padding * 2;
    this.h = child.h + this.padding * 2;
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
