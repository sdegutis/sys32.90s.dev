import { Box } from "./box.js";
import { Button } from "./button.js";
import { Group } from "./group.js";
import { Label } from "./label.js";
import { build, makeBuilder, Screen } from "./screen.js";

export class Checkbox extends Button {

  onChange?() { }

  get check() { return this.checkmark.background; }
  set check(n: number) { this.checkmark.background = n; }

  get size() { return this.checkmark.w; }
  set size(n: number) { this.checkmark.w = this.checkmark.h = n; }

  checkmark = build(this.screen, Box, {
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

export function demo(screen: Screen) {
  const b = makeBuilder(screen);
  return b(Group, { padding: 3 },

    b(Checkbox, {}),

    b(Checkbox, { padding: 2 }),

    b(Group, {
      onMouseEnter() { this.firstChild!.onMouseEnter!() },
      onMouseExit() { this.firstChild!.onMouseExit!() },
      onMouseDown(t) { this.firstChild!.onMouseDown!(t) },
    },
      b(Checkbox, { padding: 2, size: 2, onChange() { console.log('foo', this.checked) } }),
      b(Label, { text: 'foo' }),
    ),

    b(Group, {
      onMouseEnter() { this.lastChild!.onMouseEnter!() },
      onMouseExit() { this.lastChild!.onMouseExit!() },
      onMouseDown(t) { this.lastChild!.onMouseDown!(t) },
    },
      b(Label, { text: 'bar' }),
      b(Checkbox, { padding: 2, size: 2, onChange() { console.log('bar', this.checked) } }),
    ),

  );
}
