import { PanedXB, PanedYA } from "../../os/containers/paned.js"
import { SplitY } from "../../os/containers/split.js"
import { View } from "../../os/core/view.js"
import { $ } from "../../os/util/dyn.js"
import { vacuumAllLayout } from "../../os/util/layouts.js"
import { ColorChooser } from "./colorchooser.js"
import { SpriteCanvas } from "./spritecanvas.js"
import { Spritesheet } from "./spritesheet.js"

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
