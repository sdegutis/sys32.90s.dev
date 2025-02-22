import { View } from "../core/view.js";

export class Paned extends View {

  gap = 0;
  dir: 'x' | 'y' = 'x';
  vacuum: 'a' | 'b' = 'a';

  override layout(): void {
    const [a, b] = this.children;
    const favored = ({ a, b })[this.vacuum];

    const dx = this.dir;
    const dw = dx === 'x' ? 'w' : 'h';
    const v = favored[dw];

    a.x = b.x = 0;
    a.y = b.y = 0;
    a.w = b.w = this.w;
    a.h = b.h = this.h;

    const pos = (this.vacuum === 'a' ? v : this[dw] - v);
    a[dw] = pos;
    b[dx] = pos + this.gap;
    b[dw] = this[dw] - pos - this.gap;
  }

}

export class PanedXA extends Paned {
  override dir = 'x' as const;
  override vacuum = 'a' as const;
}

export class PanedXB extends Paned {
  override dir = 'x' as const;
  override vacuum = 'b' as const;
}

export class PanedYA extends Paned {
  override dir = 'y' as const;
  override vacuum = 'a' as const;
}

export class PanedYB extends Paned {
  override dir = 'y' as const;
  override vacuum = 'b' as const;
}
