import { View } from "../core/view.js";
import { Font } from "../core/font.js";

export class Label extends View {

  padding = 0;

  text = '';
  font = Font.crt2025;
  color = 0xffffffff;
  override passthrough = true;

  override adjust(): void {
    const size = this.font.calcSize(this.text);
    this.w = size.w + this.padding * 2;
    this.h = size.h + this.padding * 2;
  }

  override draw() {
    this.sys.font.print(this.sys, this.padding, this.padding, this.color, this.text);
  }

}

export function wrapButton(findButton: (view: View) => View) {
  return {
    onMouseEnter(this: View) { findButton(this).onMouseEnter?.() },
    onMouseExit(this: View) { findButton(this).onMouseExit?.() },
    onMouseDown(this: View) { findButton(this).onMouseDown?.() },
  };
}
