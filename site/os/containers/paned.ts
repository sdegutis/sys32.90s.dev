import { View } from "../core/view.js"

export class Paned extends View {

  gap = 0
  dir: 'x' | 'y' = 'x'
  vacuum: 'a' | 'b' = 'a'

  override onChildResized(): void { }

  override layout(): void {
    const a = { ...this.children[0] }
    const b = { ...this.children[1] }

    const favored = ({ a, b })[this.vacuum]

    const dx = this.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const vv = favored[dw]

    a.x = b.x = 0
    a.y = b.y = 0
    a.w = b.w = this.w
    a.h = b.h = this.h

    if (this.vacuum === 'a') {
      const pos = vv
      a[dw] = pos
      b[dx] = pos + this.gap
      b[dw] = this[dw] - a[dw] - this.gap
    }
    else {
      const pos = this[dw] - vv - this.gap
      a[dw] = pos
      b[dx] = pos + this.gap
      b[dw] = vv
    }

    this.children[0].x = a.x
    this.children[0].y = a.y
    this.children[0].w = a.w
    this.children[0].h = a.h
    this.children[1].x = b.x
    this.children[1].y = b.y
    this.children[1].w = b.w
    this.children[1].h = b.h
  }

}

export class PanedXA extends Paned {
  override dir = 'x' as const
  override vacuum = 'a' as const
}

export class PanedXB extends Paned {
  override dir = 'x' as const
  override vacuum = 'b' as const
}

export class PanedYA extends Paned {
  override dir = 'y' as const
  override vacuum = 'a' as const
}

export class PanedYB extends Paned {
  override dir = 'y' as const
  override vacuum = 'b' as const
}
