import { BorderBox, Box } from "./box.js";
import { Button } from "./button.js";
import { Label } from "./label.js";
import { makeFlowLayout } from "./layouts.js";
import { make } from "./screen.js";

export class Checkbox extends Button {

  #checked = false;
  onChange?() { }

  override border = 0x00000000;
  override padding = 0;

  #checkmark = make(this.screen, Box, {
    w: 2, h: 2,
    background: 0xffffffff,
    passthrough: true,
    visible: false,
  });

  #fakebutton = make(this.screen, BorderBox, {
    w: 6, h: 6,
    passthrough: true,
    children: [this.#checkmark],
  });

  #layout = makeFlowLayout(0, 0);

  #label = make(this.screen, Label, {
    text: '',
    padding: 1,
  });

  get text() { return this.#label.text; }
  set text(s: string) { this.#label.text = s; }

  override children = [this.#fakebutton, this.#label];

  // override draw(): void {
  //   if (this.pressed) {
  //     this.screen.rectFill(0, 0, this.#fakebutton.w, this.h, this.pressColor);
  //   }
  //   else if (this.hovered) {
  //     this.screen.rectFill(0, 0, this.#fakebutton.w, this.h, this.hoverColor);
  //   }
  // }

  override layout(): void {
    super.layout();
    this.#layout();

    this.#checkmark.x = 2;
    this.#checkmark.y = 2;

    this.#fakebutton.x = this.padding;
    this.#fakebutton.y = this.padding;

    this.#label.x += 1 + this.padding;
    this.#label.y = this.padding;
  }

  override adjust(): void {
    super.adjust();
    if (this.text.length > 0) {
      this.w += this.#label.w + 1;
    }
  }

  get checked() { return this.#checked; }
  set checked(is: boolean) {
    if (is !== this.#checked) {
      this.#checked = is;
      this.onChange?.();
      this.#checkmark.visible = this.checked;
    }
  }

  override onClick(): void {
    this.checked = !this.checked;
  }

}
