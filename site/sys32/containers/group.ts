import { View } from "../core/view.js";

export class Group extends View {

  gap = 0;
  dir: 'x' | 'y' = 'x';
  align: 'a' | 'n' | 'z' = 'n';

  override passthrough = true;

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
  }

  override layout(): void {
    const dw = this.dir === 'x' ? 'w' : 'h';
    const dh = this.dir === 'x' ? 'h' : 'w';
    const dx = this.dir === 'x' ? 'x' : 'y';
    const dy = this.dir === 'x' ? 'y' : 'x';

    let x = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child[dx] = x;
      x += child[dw] + this.gap;
      child[dy] = this.align === 'n' ? Math.round((this[dh] - child[dh]) / 2) :
        this.align === 'a' ? 0 :
          this[dh] - child[dh];
    }
  }

}

export class GroupX extends Group {
  override dir = 'x' as const;
}

export class GroupY extends Group {
  override dir = 'y' as const;
}
