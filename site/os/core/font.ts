import { Bitmap, type BitmapLike } from "./bitmap.js";

export const CHARSET = Array(95).keys().map(i => String.fromCharCode(i + 32)).toArray();

export class Font {

  chars: Record<string, BitmapLike> = {};
  width: number;
  height: number;

  static fromString(s: string) {
    const all = Bitmap.fromString(s);
    const w = all.width / 16;
    const h = all.height / 6;

    let chars: Record<string, BitmapLike> = {};

    for (const [i, ch] of CHARSET.entries()) {
      const x = i % 16 * w;
      const y = Math.floor(i / 16) * h;
      chars[ch] = all.makeView(x, y, w, h);
    }

    return new Font(chars);
  }

  constructor(chars: Record<string, BitmapLike>) {
    this.width = chars['a'].width;
    this.height = chars['a'].height;
    this.chars = chars;
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
