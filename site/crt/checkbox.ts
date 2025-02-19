import { Button } from "./button.js";
import { Group } from "./group.js";
import { Label } from "./label.js";
import { makeBuilder, System } from "./system.js";

export class Checkbox extends Button {

  onChange?() { }

  checkColor = 0xffffffff;
  size = 2;
  #checked = false;

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
    this.drawCheck();
  }

  drawCheck() {
    if (this.checked) {
      this.sys.rectFill(this.padding, this.padding, this.size, this.size, this.checkColor);
    }
  }

  override onClick(): void {
    super.onClick?.();
    this.checked = !this.checked;
  }

}

export function demo(sys: System) {
  const b = makeBuilder(sys);
  return b(Group, { padding: 3 },

    b(Checkbox, { checked: true, }),

    b(Checkbox, { checked: true, padding: 0 }),
    b(Checkbox, { checked: true, padding: 1 }),
    b(Checkbox, { checked: true, padding: 2 }),
    b(Checkbox, { checked: true, padding: 3 }),
    b(Checkbox, { checked: true, padding: 4 }),
    b(Checkbox, { checked: true, padding: 5 }),

    b(Checkbox, { checked: true, size: 0, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 1, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 2, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 3, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 4, padding: 2, checkColor: 0x990000ff }),
    b(Checkbox, { checked: true, size: 5, padding: 2, checkColor: 0x990000ff }),

    b(Checkbox, { checked: true, size: 0 }),
    b(Checkbox, { checked: true, size: 1 }),
    b(Checkbox, { checked: true, size: 2 }),
    b(Checkbox, { checked: true, size: 3 }),
    b(Checkbox, { checked: true, size: 4 }),
    b(Checkbox, { checked: true, size: 5 }),

    b(Group, {
      onMouseEnter() { this.firstChild!.onMouseEnter!() },
      onMouseExit() { this.firstChild!.onMouseExit!() },
      onMouseDown() { this.firstChild!.onMouseDown!() },
    },
      b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
      b(Label, { text: 'foo' }),
    ),

    b(Group, {
      onMouseEnter() { this.lastChild!.onMouseEnter!() },
      onMouseExit() { this.lastChild!.onMouseExit!() },
      onMouseDown() { this.lastChild!.onMouseDown!() },
    },
      b(Label, { text: 'bar' }),
      b(Checkbox, { checked: true, padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
    ),

  );
}
