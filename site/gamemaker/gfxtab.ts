import { ResizerView } from "../apps/painter/resizer.js"
import { Border } from "../os/containers/border.js"
import { GridX } from "../os/containers/grid.js"
import { GroupX, GroupY } from "../os/containers/group.js"
import { PanedXB, PanedYA } from "../os/containers/paned.js"
import { SplitY } from "../os/containers/split.js"
import { Button } from "../os/controls/button.js"
import { Label } from "../os/controls/label.js"
import { Bitmap } from "../os/core/bitmap.js"
import { crt } from "../os/core/crt.js"
import { Cursor } from "../os/core/cursor.js"
import { sys } from "../os/core/system.js"
import { View } from "../os/core/view.js"
import { makeStripeDrawer } from "../os/util/draw.js"
import { $, Dynamic } from "../os/util/dyn.js"
import { vacuumAllLayout } from "../os/util/layouts.js"
import { dragMove } from "../os/util/selections.js"

type Color = { p: keyof typeof palettes, i: number }

class Spritesheet extends Dynamic {

  sprites: Sprite[] = [$(Sprite)]
  current = 0

  color: Color = { p: 'vinik24', i: 8 }

  get sprite() { return this.sprites[this.current] }

  changeColorBy(n: number) {
    let i = this.color.i + n
    if (i < 0) i = 23
    if (i > 23) i = 0
    this.color = { p: this.color.p, i }
  }

}

class Sprite extends Dynamic {

  width = 8
  height = 8

  images: SpriteImage[] = [
    $(SpriteImage, {})
  ]

  override init(): void {
    this.$watch('images', images => {
      for (const image of images) {
        image.sprite = this
      }
    })
  }

}

class SpriteImage extends Dynamic {

  sprite: Sprite = null!

  override init(): void {
    this.$watch('sprite', s => {
    })
  }

}

export class SpriteEditor extends View {

  override background = 0x000000ff
  override layout = vacuumAllLayout.layout

  sheet = $(Spritesheet)

  override init(): void {
    this.children = [
      $(PanedYA, {},
        $(PanedXB, { background: 0xffffff22, adjust() { this.h = this.lastChild!.h } },
          $(SpriteCanvas, { $sheet: this.$ref('sheet') }),
          $(ColorChooser, { $sheet: this.$ref('sheet') })
        ),
        $(SplitY, { pos: 30 },
          $(View, { background: 0x000000ff }),
          $(View, { background: 0x333333ff }),
        ),
      )
    ]
  }

}

const moveCursor = Cursor.fromBitmap(new Bitmap([0x000000cc, 0xffffffff, 0xfffffffe], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 3, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

class SpriteCanvas extends View {

  sheet: Spritesheet = null!
  zoom = 4
  drawer!: SpriteDrawer

  override layout = vacuumAllLayout.layout
  override draw = makeStripeDrawer(4, 2)
  override cursor = moveCursor

  override init(): void {
    const $zoom = this.$ref('zoom')

    this.children = [
      $(View, { passthrough: true, },
        this.drawer = $(SpriteDrawer, { x: 10, y: 10, $sheet: this.$ref('sheet'), $zoom }),
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
      this.sheet.changeColorBy(up ? +1 : -1)
    }
  }

}

class SpriteDrawer extends View {

  sheet: Spritesheet = null!

  override background = 0x00000033
  override cursor = null

  zoom = 1

  spots: Record<string, Color> = {}

  override init(): void {
    this.$watch('zoom', () => sys.layoutTree(this.parent!))
  }

  override adjust(): void {
    this.w = this.sheet.sprite.width * this.zoom
    this.h = this.sheet.sprite.height * this.zoom
  }

  override onMouseDown(button: number): void {
    if (button === 0) {
      if (sys.keys[' ']) {
        const drag = dragMove(this)
        sys.trackMouse({
          move: () => {
            drag()
            sys.layoutTree(this.parent)
          }
        })
      }
      else {
        sys.trackMouse({
          move: () => {
            const x = Math.floor(this.mouse.x / this.zoom)
            const y = Math.floor(this.mouse.y / this.zoom)

            const key = `${x},${y}`
            this.spots[key] = this.sheet.color
          }
        })
      }
    }
    else if (sys.keys['Control']) {
      const x = Math.floor(this.mouse.x / this.zoom)
      const y = Math.floor(this.mouse.y / this.zoom)

      const key = `${x},${y}`
      const spot = this.spots[key]
      if (spot) {
        this.sheet.color = spot
      }
    }
    else {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / this.zoom)
          const y = Math.floor(this.mouse.y / this.zoom)

          const key = `${x},${y}`
          delete this.spots[key]
        }
      })
    }
  }

  override draw(): void {
    super.draw()

    for (let y = 0; y < this.sheet.sprite.height; y++) {
      for (let x = 0; x < this.sheet.sprite.width; x++) {
        const key = `${x},${y}`
        const spot = this.spots[key]
        if (spot) {
          const px = x * this.zoom
          const py = y * this.zoom
          const col = palettes[spot.p][spot.i]
          crt.rectFill(px, py, this.zoom, this.zoom, col)
        }
      }
    }

    if (this.hovered) {
      const px = Math.floor(this.mouse.x / this.zoom) * this.zoom
      const py = Math.floor(this.mouse.y / this.zoom) * this.zoom
      crt.rectLine(px, py, this.zoom, this.zoom, 0x1199ff99)
    }
  }

  resize(width: number, height: number) {
    this.sheet.sprite.width = Math.max(1, width)
    this.sheet.sprite.height = Math.max(1, height)
    sys.layoutTree()
  }

}

class ColorChooser extends Border {

  sheet: Spritesheet = null!

  override init(): void {
    const $color = this.sheet.$ref('color')

    this.children = [
      $(Border, { background: 0x00000033, padding: 2 },
        $(GroupY, { gap: 1 },
          $(GroupY, {},

            ...Object.keys(palettes).map((name) => {
              return $(Button, {
                padding: 2,
                $selected: $color.adapt(d => d.p === name),
                onClick: () => {
                  $color.update({ i: $color.data.i, p: name as keyof typeof palettes })
                },
              },
                $(Label, { text: name })
              )
            })

          ),
          $(Border, { padding: 0 },
            $(GridX, { cols: 4, gap: -1 },
              ...palettes.vinik24.map((color, i) => {
                const button = $(Button, {
                  padding: 1,
                  $selected: $color.adapt(col => col.i === i),
                  selectedBackground: 0x00000000,
                  selectedBorderColor: 0xffffffff,
                  onClick: () => $color.update({ p: $color.data.p, i }),
                },
                  $(View, { w: 7, h: 7, passthrough: true, $background: $color.adapt(d => palettes[d.p][i]) })
                )
                return button
              }
              )
            )
          ),
          $(Border, { padding: 1 },
            $(GroupX, { gap: 3, },
              $(GroupX, {}, $(Label, { text: 'w:', color: 0xffffff33 }), $(Label, { $text: this.sheet.sprite.$ref('width').adapt(n => n.toString()) })),
              $(GroupX, {}, $(Label, { text: 'h:', color: 0xffffff33 }), $(Label, { $text: this.sheet.sprite.$ref('height').adapt(n => n.toString()) })),
            )
          )

        )
      )
    ]
  }

}

const palettes = {

  vinik24: [
    0x000000ff, 0x6f6776ff, 0x9a9a97ff, 0xc5ccb8ff, 0x8b5580ff, 0xc38890ff,
    0xa593a5ff, 0x666092ff, 0x9a4f50ff, 0xc28d75ff, 0x7ca1c0ff, 0x416aa3ff,
    0x8d6268ff, 0xbe955cff, 0x68aca9ff, 0x387080ff, 0x6e6962ff, 0x93a167ff,
    0x6eaa78ff, 0x557064ff, 0x9d9f7fff, 0x7e9e99ff, 0x5d6872ff, 0x433455ff,
  ],

  sweet24: [
    0x2c4941ff, 0x66a650ff, 0xb9d850ff, 0x82dcd7ff, 0x208cb2ff, 0x253348ff,
    0x1d1b24ff, 0x3a3a41ff, 0x7a7576ff, 0xb59a66ff, 0xcec7b1ff, 0xedefe2ff,
    0xd78b98ff, 0xa13d77ff, 0x6d2047ff, 0x3c1c43ff, 0x2c2228ff, 0x5e3735ff,
    0x885a44ff, 0xb8560fff, 0xdc9824ff, 0xefcb84ff, 0xe68556ff, 0xc02931ff,
  ],

}
