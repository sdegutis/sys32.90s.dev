import { Box } from "./box.js";
import { Font } from "./font.js";

export class Label extends Box {

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
    this.sys.print(this.padding, this.padding, this.color, this.text);
  }

}
