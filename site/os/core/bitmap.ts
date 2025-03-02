import { crt } from "./crt.js";

export class Bitmap {

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

  draw(px: number, py: number, c?: number) {
    let i = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ci = this.pixels[i++];
        if (ci > 0) crt.pset(px + x, py + y, c ?? this.colors[ci - 1]);
      }
    }
  }

  static fromString(s: string) {
    const [top, bottom] = s.replace(/\r\n/g, '\n').split('\n\n');
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
