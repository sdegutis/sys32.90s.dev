import { Border } from "../os/containers/border.js"
import { GridX } from "../os/containers/grid.js"
import { GroupY } from "../os/containers/group.js"
import { PanedXB, PanedYA } from "../os/containers/paned.js"
import { SplitY } from "../os/containers/split.js"
import { Button } from "../os/controls/button.js"
import { Label } from "../os/controls/label.js"
import { crt } from "../os/core/crt.js"
import { sys } from "../os/core/system.js"
import { $, View } from "../os/core/view.js"
import { multiplex, Reactive } from "../os/util/events.js"
import { makeCollapseAdjust, vacuumAllLayout } from "../os/util/layouts.js"
import { dragMove } from "../os/util/selections.js"

export class SpriteEditor extends View {

  override background = 0x000000ff
  override layout = vacuumAllLayout

  override init(): void {
    const $color = new Reactive(0)

    this.children = [
      $(PanedYA, {},
        $(PanedXB, { background: 0xffffff22, adjust() { this.h = this.lastChild!.h } },
          $(SpriteCanvas, { $color }),
          $(ColorChooser, { $color })
        ),
        $(SplitY, { pos: 30, resizable: true },
          $(View, { background: 0x000000ff }),
          $(View, { background: 0x333333ff }),
        ),
      )
    ]
  }

}

class SpriteCanvas extends View {

  color = 0x00000000
  zoom = 1

  // override layout = centerLayout

  override init(): void {
    this.children = [
      $(SpriteDrawer, { $color: this.$data('color'), $zoom: this.$data('zoom') })
    ]
  }

  override onMouseDown(button: number): void {
    if (sys.keys[' ']) {
      const move = dragMove(this.firstChild!)
      sys.trackMouse({ move })
    }
  }

  override onScroll(up: boolean): void {
    const min = 1
    const max = 8
    this.zoom = Math.min(max, Math.max(min, this.zoom + (up ? +1 : -1)))
  }

}

class SpriteDrawer extends View {

  override background = 0x000000ff
  override cursor = null

  color = 0x00000000
  zoom = 1

  width = 8
  height = 8

  override init(): void {
    this.$watch('zoom', () => sys.layoutTree(this.parent!))
  }

  override onMouseDown(button: number): void {
    if (sys.keys[' ']) {
      this.parent!.onMouseDown!(button)
      return
    }
  }

  override adjust(): void {
    this.w = this.width * this.zoom
    this.h = this.height * this.zoom
  }

  override draw(): void {
    super.draw()

    const tx = Math.floor(this.mouse.x / this.zoom) * this.zoom
    const ty = Math.floor(this.mouse.y / this.zoom) * this.zoom

    crt.rectFill(tx, ty, this.zoom, this.zoom, this.color)
  }

}

class ColorChooser extends View {

  color = 0x00000000
  override adjust = makeCollapseAdjust

  override init(): void {
    const $palette = new Reactive<keyof typeof palettes>('sweet24')
    const $colori = new Reactive(0)

    multiplex({ p: $palette, i: $colori }).watch(d => { this.color = palettes[d.p][d.i] })

    $palette.watch(p => this.color = palettes[$palette.data][$colori.data])
    $colori.watch(p => this.color = palettes[$palette.data][$colori.data])

    this.children = [
      $(Border, { background: 0x00000033, padding: 2 },
        $(GroupY, {},
          $(GroupY, {},

            ...Object.keys(palettes).map((name) => {
              return $(Button, {
                padding: 2,
                $selected: $palette.adapt(p => p === name),
                onClick: () => { $palette.update(name as keyof typeof palettes) },
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
                  $selected: $colori.adapt(index => index === i),
                  selectedBorderColor: 0xffffffff,
                  onClick: () => $colori.update(i),
                },
                  $(View, { w: 7, h: 7, passthrough: true, $background: $palette.adapt(p => palettes[p][i]) })
                )
                return button
              }
              )
            )
          ))
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
