import { Bitmap } from "../core/bitmap.js"
import { crt } from "../core/crt.js"
import { Cursor } from "../core/cursor.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { $ } from "../util/dyn.js"
import { dragMove } from "../util/selections.js"

const xresize = Cursor.fromBitmap(new Bitmap([0x00000099, 0xffffffff, 0xfffffffe], 5, [
  1, 1, 1, 1, 1,
  1, 2, 3, 2, 1,
  1, 1, 1, 1, 1,
]))

const yresize = Cursor.fromBitmap(new Bitmap([0x00000099, 0xffffffff, 0xfffffffe], 3, [
  1, 1, 1,
  1, 2, 1,
  1, 3, 1,
  1, 2, 1,
  1, 1, 1,
]))

class SplitDivider extends View {

  pressed = false
  split!: Split

  override init(): void {
    const dividerColor = 0x33333300
    this.background = dividerColor
    this.cursor = this.split.dir === 'x' ? xresize : yresize
  }

  override onResized(): void {
  }

  override draw(): void {
    super.draw()

    const dividerColorHover = 0xffffff33
    const dividerColorPress = 0x1177ffcc
    const dividerWidth = 1

    const dx = this.split.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const x = dx === 'x' ? Math.round((this[dw] - dividerWidth) / 2) : 0
    const y = dx === 'y' ? Math.round((this[dw] - dividerWidth) / 2) : 0
    const w = dx === 'x' ? dividerWidth : this.w
    const h = dx === 'y' ? dividerWidth : this.h

    if (this.pressed) {
      crt.rectFill(x, y, w, h, dividerColorPress)
    }
    else if (this.hovered) {
      crt.rectFill(x, y, w, h, dividerColorHover)
    }
  }

  override onMouseDown(): void {
    const s = this.split
    const dx = s.dir
    const dw = dx === 'x' ? 'w' : 'h'

    const b = { x: 0, y: 0 }
    b[dx] = s.pos

    this.pressed = true

    const drag = dragMove(b)
    sys.trackMouse({
      move: () => {
        drag()
        s.pos = b[dx]
        if (s.min && s.pos < s.min) s.pos = s.min
        if (s.max && s.pos > s[dw] - s.max) s.pos = s[dw] - s.max
      },
      up: () => this.pressed = false,
    })
  }

}

export class Split extends View {

  pos = 10
  min = 0
  max = 0
  dir: 'x' | 'y' = 'y'

  private resizer!: SplitDivider

  override init(): void {
    this.resizer = $(SplitDivider, { split: this })
    this.addChild(this.resizer)
    this.$watch('pos', () => this.layout())
  }

  // override onChildResized(): void {
  //   // this.layout()
  // }

  override layout(): void {
    const dx = this.dir
    const dw = dx === 'x' ? 'w' : 'h'
    const a = { ...this.children[0] }
    const b = { ...this.children[1] }

    a.x = b.x = 0
    a.y = b.y = 0
    a.w = b.w = this.w
    a.h = b.h = this.h

    a[dw] = this.pos

    b[dx] = this.pos
    b[dw] = this[dw] - this.pos

    if (this.resizer) {
      this.resizer.x = 0
      this.resizer.y = 0
      this.resizer[dx] = this.pos - 1

      this.resizer.w = this.w
      this.resizer.h = this.h
      this.resizer[dw] = 2
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

export class SplitX extends Split {
  override dir = 'x' as const
}

export class SplitY extends Split {
  override dir = 'y' as const
}
