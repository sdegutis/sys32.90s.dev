import { sys } from "../core/system.js";
import { View } from "../core/view.js";

export class Label extends View {

  text = '';
  font = sys.mem.font;
  color = 0xffffffff;
  override passthrough = true;

  override init(): void {
    this.font = sys.mem.font;
  }

  override adjust(): void {
    const size = this.font.calcSize(this.text);
    this.w = size.w;
    this.h = size.h;
  }

  override draw() {
    super.draw();
    this.font.print(0, 0, this.color, this.text);
  }

}
