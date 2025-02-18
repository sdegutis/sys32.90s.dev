import { BorderBox } from "./box.js";
import { Font } from "./font.js";
import { Screen } from "./screen.js";

export class Label extends BorderBox {

  #text = '';
  font = Font.crt2025;
  padding = 1;
  override passthrough = true;

  constructor(screen: Screen, text: string) {
    super(screen);
    this.text = text;
  }

  get text() { return this.#text; }
  set text(s: string) {
    this.#text = s;
    const size = this.font.calcSize(s);
    this.w = size.w + this.padding * 2;
    this.h = size.h + this.padding * 2;
  }

  override draw() {
    this.screen.print(this.padding, this.padding, 0xffffffff, this.text);
  }

}
