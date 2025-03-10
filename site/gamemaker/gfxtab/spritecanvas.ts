import { ResizerView } from "../../apps/painter/resizer.js"
import { Bitmap } from "../../os/core/bitmap.js"
import { Cursor } from "../../os/core/cursor.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { makeStripeDrawer } from "../../os/util/draw.js"
import { $ } from "../../os/util/dyn.js"
import { vacuumAllLayout } from "../../os/util/layouts.js"
import { dragMove } from "../../os/util/selections.js"
import type { Color } from "./palettes.js"
import { SpriteDrawer } from "./spritedrawer.js"
import type { Spritesheet } from "./spritesheet.js"

const moveCursor = Cursor.fromBitmap(new Bitmap([0x000000cc, 0xffffffff, 0xfffffffe], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 3, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

export class SpriteCanvas extends View {

  sheet!: Spritesheet
  zoom = 4
  drawer!: SpriteDrawer

  color: Color = null!

  override layout = vacuumAllLayout.layout
  override draw = makeStripeDrawer(4, 2)
  override cursor = moveCursor

  override init(): void {
    const $zoom = this.$ref('zoom')

    this.children = [
      $(View, { passthrough: true, },
        this.drawer = $(SpriteDrawer, {
          x: 10, y: 10,
          $sheet: this.$ref('sheet'),
          $color: this.$ref('color'),
          $zoom
        }),
        $(ResizerView<SpriteDrawer>)
      )
    ]
  }

  override onMouseDown(button: number): void {
    const drag = dragMove(this.drawer)
    sys.trackMouse({
      move: () => {
        drag()
        sys.layoutTree(this)
      }
    })
  }

  override onScroll(up: boolean): void {
    if (!sys.keys['Control']) {
      const min = 1
      const max = 8
      this.zoom = Math.min(max, Math.max(min, this.zoom + (up ? +1 : -1)))
    }
    else {
      this.changeColorBy(up ? +1 : -1)
    }
  }

  private changeColorBy(n: number) {
    let i = this.color.i + n
    if (i < 0) i = 23
    if (i > 23) i = 0
    this.color = { p: this.color.p, i }
  }

}
