import { Button } from "./button.js";

export class Checkbox extends Button {

  onChange?() { }

  borderColor = 0xffffff33;
  checkColorOn = 0xffffffff;
  checkColorOff = 0x00000000;
  size = 2;
  #checked = false;

  override padding = 2;

  get checked() { return this.#checked; }
  set checked(is: boolean) {
    if (is !== this.#checked) {
      this.#checked = is;
      this.onChange?.();
    }
  }

  override adjust(): void {
    this.w = this.h = this.padding * 2 + this.size;
  }

  override draw(): void {
    super.draw();

    if ((this.borderColor & 0x000000ff) > 0) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, this.borderColor);
    }

    this.drawCheck();
  }

  drawCheck() {
    this.sys.crt.rectFill(
      this.padding,
      this.padding,
      this.size,
      this.size,
      this.checked ? this.checkColorOn : this.checkColorOff
    );
  }

  override onClick(): void {
    super.onClick?.();
    this.checked = !this.checked;
  }

}
