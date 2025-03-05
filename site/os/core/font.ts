import { Bitmap, type BitmapLike } from "./bitmap.js";

export const CHARSET = Array(95).keys().map(i => String.fromCharCode(i + 32)).toArray();

export class Font {

  charsheet: Bitmap;
  chars: Record<string, BitmapLike> = {};
  width: number;
  height: number;

  constructor(data: string) {
    this.charsheet = Bitmap.fromString(data);
    this.width = this.charsheet.width / 16;
    this.height = this.charsheet.height / 6;

    for (const [i, ch] of CHARSET.entries()) {
      const x = i % 16 * this.width;
      const y = Math.floor(i / 16) * this.height;
      this.chars[ch] = this.charsheet.makeView(x, y, this.width, this.height);
    }
  }

  calcSize(text: string) {
    let x = 0;
    let w = 0;
    let h = 1;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        h++;
        x = 0;
      }
      else {
        x++;
        w = Math.max(x, w);
      }
    }

    return {
      w: w * (this.width + 1) - 1,
      h: h * (this.height + 2) - 2,
    };
  }

  print(x: number, y: number, c: number, text: string) {
    let posx = 0;
    let posy = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (ch === '\n') {
        posy++;
        posx = 0;
        continue;
      }

      const map = this.chars[ch];

      const px = x + (posx * (this.width + 1));
      const py = y + (posy * (this.height + 2));

      map.draw(px, py, c);

      posx++;
    }
  }

}
