import { Border } from "../os/containers/border.js"
import { GridX } from "../os/containers/grid.js"
import { SplitY } from "../os/containers/split.js"
import { Button } from "../os/controls/button.js"
import { $, View } from "../os/core/view.js"
import { Reactive } from "../os/util/events.js"
import { centerLayout, vacuumAllLayout } from "../os/util/layouts.js"

class ColorButton extends Button {

  selected = false

  override init(): void {
    super.init()
    this.$watch('selected', s => {

    })
  }

}

export class SpriteEditor extends View {

  override background = 0x000000ff

  override layout = vacuumAllLayout

  override init(): void {
    const $color = new Reactive(palettes.vinik24[0])

    this.children = [
      $(SplitY, { pos: 70, resizable: true },
        $(View, { background: 0x000000ff, layout: centerLayout },
          $(Border, { background: 0xffffff22, padding: 0 },
            $(GridX, { cols: 4, gap: -1 },
              ...palettes.vinik24.map(n => {
                const button = $(ColorButton, { padding: 1, onClick: () => $color.update(n) },
                  $(View, { w: 7, h: 7, passthrough: true, background: n })
                )
                $color.watch(c => button.selected = c === n)
                return button
              }
              )
            )
          )
        ),
        $(SplitY, { pos: 30, resizable: true },
          $(View, { background: 0x222222ff }),
          $(View, { background: 0x333333ff }),
        ),
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
