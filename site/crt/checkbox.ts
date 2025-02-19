import { BorderBox, Box, MouseTracker } from "./box.js";
import { Button } from "./button.js";
import { Label } from "./label.js";
import { makeFlowLayout } from "./layouts.js";
import { build } from "./screen.js";

export class Checkbox extends Box {

  onChange?() { }

  get padding() { return this.label.padding; }
  set padding(n: number) {
    if (n < 1) n = 1;
    this.label.padding = n;
  }

  get border() { return this.button.border; }
  set border(n: number) { this.button.border = n; }

  get check() { return this.checkmark.background; }
  set check(n: number) { this.checkmark.background = n; }

  checkmark = build(this.screen, Box, {
    w: 2, h: 2,
    background: 0xffffffff,
    passthrough: true,
    visible: false,
  });

  button = build(this.screen, Button, {
    w: 6, h: 6,
    padding: 1,
    children: [this.checkmark],
    onClick: () => {
      this.checked = !this.checked;
    },
  });

  #layout = makeFlowLayout(0, 0);

  label = build(this.screen, Label, {
    text: '',
    padding: 1,
  });

  get text() { return this.label.text; }
  set text(s: string) { this.label.text = s; }

  override children = [this.button, this.label];

  override layout(): void {
    this.#layout();
    this.checkmark.x = 2;
    this.checkmark.y = 2;
    this.label.y--;
  }

  override adjust(): void {
    this.button.padding = 0;
    this.screen.layoutTree(this.label);
    this.screen.layoutTree(this.button);
    this.button.padding = this.padding;

    this.w = this.button.w + this.padding * 2;
    this.h = Math.max(this.button.h, this.label.h) - 2;

    this.screen.layoutTree(this.button);

    if (this.text.length > 0) {
      this.w += this.label.w + 1;
    }
  }

  get checked() { return this.checkmark.visible; }
  set checked(is: boolean) {
    if (is !== this.checkmark.visible) {
      this.checkmark.visible = is;
      this.onChange?.();
    }
  }

  override onMouseEnter(): void {
    this.button.onMouseEnter();
  }

  override onMouseExit(): void {
    this.button.onMouseExit();
  }

  override onMouseDown(trackMouse: MouseTracker): void {
    this.button.onMouseDown(trackMouse);
  }

}
