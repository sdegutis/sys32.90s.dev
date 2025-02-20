import { Box } from "./box.js";

export class Group extends Box {

  padding = 0;

  dir: 'x' | 'y' = 'x';
  gap = 0;

  override adjust(): void {
    const dw = this.dir === 'x' ? 'w' : 'h';
    const dh = this.dir === 'x' ? 'h' : 'w';

    this[dw] = this[dh] = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      this[dw] += child[dw];
      if (i > 0) this[dw] += this.gap;
      if (this[dh] < child[dh]) this[dh] = child[dh];
    }

    this[dw] += this.padding * 2;
    this[dh] += this.padding * 2;
  }

  override layout(): void {
    const dw = this.dir === 'x' ? 'w' : 'h';
    const dh = this.dir === 'x' ? 'h' : 'w';
    const dx = this.dir === 'x' ? 'x' : 'y';
    const dy = this.dir === 'x' ? 'y' : 'x';

    let x = this.padding;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child[dx] = x;
      x += child[dw] + this.gap;
      child[dy] = Math.round((this[dh] - child[dh]) / 2);
    }
  }

}
