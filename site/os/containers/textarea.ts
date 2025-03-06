import { Label } from "../controls/label.js";

export class TextArea extends Label {

  // pos = { row: 0, col: 0 };
  colors: number[] = [];

  override passthrough = false;

  override draw(): void {
    super.draw();

    let c = this.color;

    const x = 0;
    const y = 0;

    const text = this.text;
    const font = this.font;

    let posx = 0;
    let posy = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (this.colors[i]) c = this.colors[i];

      if (ch === '\n') {
        posy++;
        posx = 0;
        continue;
      }

      const px = x + (posx * 4);
      const py = y + (posy * 6);

      const map = font.chars[ch];
      map.draw(px, py, c);

      posx++;

    }

  }

  override onFocus(): void {
  }

}
