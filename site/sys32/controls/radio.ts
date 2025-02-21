import { Checkbox } from "./checkbox.js";

export class RadioGroup {

  onChange?() { }

  buttons: RadioButton[] = [];
  selected?: RadioButton;

  select(button: RadioButton | undefined) {
    if (this.selected === button) return;

    this.selected = button!;
    for (const b of this.buttons) {
      b.checked = (b === button);
    }
    this.onChange?.();
  }

}

export class RadioButton extends Checkbox {

  borderSelected = 0xffffff77;
  borderHovered = 0xffffff33;

  #group?: RadioGroup;
  get group(): RadioGroup | undefined { return this.#group; }
  set group(group: RadioGroup | undefined) {
    this.#group = group!;
    if (!group?.buttons.includes(this)) {
      group?.buttons.push(this);
    }
  }

  override onClick(): void {
    super.onClick?.();
    this.checked = true;
    this.#group?.select(this);
  }

  override draw(): void {
    super.draw();

    if (this.checked) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, this.borderSelected);
    }
    else if (this.hovered) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, this.borderHovered);
    }
  }

}
