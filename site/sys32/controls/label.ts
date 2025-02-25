import { View } from "../core/view.js";

export class Label extends View {

  text = '';
  font = this.sys.font;
  color = 0xffffffff;
  override passthrough = true;

  override adjust(): void {
    const size = this.font.calcSize(this.text);
    this.w = size.w;
    this.h = size.h;
  }

  override draw() {
    this.font.print(this.sys.crt, 0, 0, this.color, this.text);
  }

}
