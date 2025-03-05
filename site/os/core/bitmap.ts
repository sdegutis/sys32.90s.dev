import { crt } from "./crt.js";

interface DrawTarget {
  pset(x: number, y: number, c: number): void;
}

export interface BitmapLike {
  width: number;
  height: number;
  draw(px: number, py: number, c?: number, target?: DrawTarget): void;
  pset(x: number, y: number, c: number): void;
  pget(x: number, y: number): number;
}

class BitmapView implements BitmapLike {

  of: Bitmap;
  private x: number;
  private y: number;
  width: number;
  height: number;

  constructor(of: Bitmap, x: number, y: number, w: number, h: number) {
    this.of = of;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  draw(px: number, py: number, c?: number, target: DrawTarget = crt) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = (this.y + y) * this.of.width + (this.x + x);
        const ci = this.of.pixels[i];
        if (ci > 0) target.pset(px + x, py + y, c ?? this.of.colors[ci - 1]);
      }
    }
  }

  pset(x: number, y: number, c: number) {
    const i = (this.y + y) * this.of.width + (this.x + x);
    this.of.pixels[i] = c;
  }

  pget(x: number, y: number) {
    const i = (this.y + y) * this.of.width + (this.x + x);
    return this.of.pixels[i];
  }

}

export class Bitmap implements BitmapLike {

  width: number;
  height: number;
  pixels: number[];
  colors: number[];

  constructor(colors: number[], w: number, pixels: number[]) {
    this.pixels = pixels;
    this.colors = colors;
    this.width = w;
    this.height = this.pixels.length / w;
  }

  makeView(x: number, y: number, w: number, h: number) {
    return new BitmapView(this, x, y, w, h);
  }

  draw(px: number, py: number, c?: number, target: DrawTarget = crt) {
    let i = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ci = this.pixels[i++];
        if (ci > 0) target.pset(px + x, py + y, c ?? this.colors[ci - 1]);
      }
    }
  }

  pset(x: number, y: number, c: number) {
    const i = x + y * this.width;
    this.pixels[i] = c;
  }

  pget(x: number, y: number) {
    const i = x + y * this.width;
    return this.pixels[i];
  }

  static fromString(s: string) {
    const [top, bottom] = s.split('\n\n');
    const colors = top.split('\n').map(s => parseInt(s, 16));
    const lines = bottom.trim().split('\n').map(s => s.split(' ').map(s => parseInt(s, 16)));
    const pixels: number[] = [];
    for (const line of lines) {
      for (const c of line) {
        pixels.push(c);
      }
    }
    return new Bitmap(colors, lines[0].length, pixels);
  }

  toString() {
    const colors = this.colors.map(c => c.toString(16).padStart(8, '0'));
    let lines: string[] = [];
    let i = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = this.pixels[i++];
        const space = x === this.width - 1 ? '\n' : ' ';
        lines.push(index.toString(16), space);
      }
    }
    return colors.join('\n') + '\n\n' + lines.join('');
  }

}
