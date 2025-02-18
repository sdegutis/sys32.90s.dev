import { Box, MouseTracker } from "./box.js";
import { Button } from "./button.js";
import { Label } from "./label.js";
import { make } from "./screen.js";

export class Checkbox extends Button {

  #checked = false;
  onChange?() { }

  override padding = 2;

  label?: Label;

  #mark = make(this.screen, Box, {
    w: 2, h: 2,
    background: 0xffffffff,
    passthrough: true,
    visible: false,
  });

  override layout(): void {
    super.layout();
  }

  override adjust(): void {
    this.children = [this.#mark];
    super.adjust();

    // if (this.label) {
    //   this.children.push(this.label);
    //   this.label?.adjust();
    //   this.w += this.label.w;
    //   this.label.x += this.#mark.w + this.padding;
    // }
  }

  get checked() { return this.#checked; }
  set checked(is: boolean) {
    const changed = is !== this.#checked;
    this.#checked = is;
    if (changed) this.onChange?.();
    this.#mark.visible = this.checked;
  }

  override onClick(): void {
    this.checked = !this.checked;
  }

  override onMouseDown(trackMouse: MouseTracker): void {
    super.onMouseDown(trackMouse);
  }

}
