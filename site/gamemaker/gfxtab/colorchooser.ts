import { Border } from "../../os/containers/border.js"
import { GridX } from "../../os/containers/grid.js"
import { GroupX, GroupY } from "../../os/containers/group.js"
import { Button } from "../../os/controls/button.js"
import { Label } from "../../os/controls/label.js"
import { View } from "../../os/core/view.js"
import { $ } from "../../os/util/dyn.js"
import { palettes, type Color } from "./palettes.js"
import type { Spritesheet } from "./spritesheet.js"

export class ColorChooser extends Border {

  sheet!: Spritesheet
  color: Color = null!

  override init(): void {
    const $color = this.$ref('color')

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
