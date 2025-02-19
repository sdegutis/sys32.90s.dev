import { Box } from "./box.js";
import { Button } from "./button.js";
import { Group } from "./group.js";
import { Label } from "./label.js";
import { build, makeBuilder, System } from "./system.js";

export class Checkbox extends Button {

  onChange?() { }

  get check() { return this.checkmark.background; }
  set check(n: number) { this.checkmark.background = n; }

  get size() { return this.checkmark.w; }
  set size(n: number) { this.checkmark.w = this.checkmark.h = n; }

  checkmark = build(this.sys, Box, {
    w: 2, h: 2,
    background: 0xffffffff,
    passthrough: true,
    visible: false,
  });

  override children = [this.checkmark];

  get checked() { return this.checkmark.visible; }
  set checked(is: boolean) {
    if (is !== this.checkmark.visible) {
      this.checkmark.visible = is;
      this.onChange?.();
    }
  }

  override onClick(): void {
    super.onClick?.();
    this.checked = !this.checked;
  }

}

export function demo(screen: System) {
  const b = makeBuilder(screen);
  return b(Group, { padding: 3 },

    b(Checkbox, {}),

    b(Checkbox, { padding: 2 }),

    b(Group, {
      onMouseEnter() { this.firstChild!.onMouseEnter!() },
      onMouseExit() { this.firstChild!.onMouseExit!() },
      onMouseDown() { this.firstChild!.onMouseDown!() },
    },
      b(Checkbox, { padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
      b(Label, { text: 'foo' }),
    ),

    b(Group, {
      onMouseEnter() { this.lastChild!.onMouseEnter!() },
      onMouseExit() { this.lastChild!.onMouseExit!() },
      onMouseDown() { this.lastChild!.onMouseDown!() },
    },
      b(Label, { text: 'bar' }),
      b(Checkbox, { padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
    ),

  );
}
