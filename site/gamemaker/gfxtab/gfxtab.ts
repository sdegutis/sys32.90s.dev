import { PanedXB, PanedYA } from "../../os/containers/paned.js"
import { SplitY } from "../../os/containers/split.js"
import { View } from "../../os/core/view.js"
import { $ } from "../../os/util/dyn.js"
import { vacuumAllLayout } from "../../os/util/layouts.js"
import { ColorChooser } from "./colorchooser.js"
import type { Color } from "./palettes.js"
import { SpriteCanvas } from "./spritecanvas.js"
import { SpriteChooser } from "./spritechooser.js"
import { SpriteImageChooser } from "./spriteimagechooser.js"
import { Spritesheet } from "./spritesheet.js"

export class SpriteEditor extends View {

  override background = 0x000000ff
  override layout = vacuumAllLayout

  sheet = $(Spritesheet)
  color: Color = { p: 'vinik24', i: 8 }

  override init(): void {
    this.children = [
      $(PanedYA, {},
        $(PanedXB, { background: 0xffffff22, adjust() { this.h = this.lastChild!.h } },
          $(SpriteCanvas, { $sheet: this.$ref('sheet'), $color: this.$ref('color') }),
          $(ColorChooser, { $sheet: this.$ref('sheet'), $color: this.$ref('color') }),
        ),
        $(SplitY, { pos: 30 },
          $(SpriteImageChooser, { $sheet: this.$ref('sheet') }),
          $(SpriteChooser, { $sheet: this.$ref('sheet') }),
        ),
      )
    ]
  }

}
