import { Box } from "../core/box.js";

export class Group extends Box {

  padding = 0;
  gap = 0;
  dir: 'x' | 'y' = 'x';

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

export class Spaced extends Box {

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
    let totalWidth = this.padding;
    for (let i = 0; i < this.children.length; i++) {
      totalWidth += this.children[i].w;
    }
    const gap = max - totalWidth;

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
