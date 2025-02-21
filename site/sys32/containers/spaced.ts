import { View } from "../core/view.js";

export class Spaced extends View {

  padding = 0;
  dir: 'x' | 'y' = 'x';

  override adjust(): void {
    const dh = this.dir === 'x' ? 'h' : 'w';
    this[dh] = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (this[dh] < child[dh]) this[dh] = child[dh];
    }
    this[dh] += this.padding * 2;
  }

  override layout(): void {
    const max = this[this.dir === 'x' ? 'w' : 'h'] - this.padding * 2;
    let combinedWidths = this.padding;
    for (let i = 0; i < this.children.length; i++) {
      combinedWidths += this.children[i].w;
    }
    const gap = Math.floor((max - combinedWidths) / (this.children.length - 1));

    const dw = this.dir === 'x' ? 'w' : 'h';
    const dh = this.dir === 'x' ? 'h' : 'w';
    const dx = this.dir === 'x' ? 'x' : 'y';
    const dy = this.dir === 'x' ? 'y' : 'x';

    let x = this.padding;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child[dx] = x;
      x += child[dw] + gap;
      child[dy] = Math.round((this[dh] - child[dh]) / 2);
    }
  }

}
