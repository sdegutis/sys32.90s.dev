import { Border } from "../../os/containers/border.js"
import { GroupX } from "../../os/containers/group.js"
import { Scroll } from "../../os/containers/scroll.js"
import { Button } from "../../os/controls/button.js"
import { Label } from "../../os/controls/label.js"
import { View } from "../../os/core/view.js"
import { $ } from "../../os/util/dyn.js"
import { vacuumFirstLayout } from "../../os/util/layouts.js"
import type { Sprite, Spritesheet } from "./spritesheet.js"

export class SpriteChooser extends View {

  sheet!: Spritesheet

  override layout = vacuumFirstLayout
  override background = 0x333333ff

  private addButton = $(Button, {
    padding: 3,
    onClick: () => { this.sheet.addSprite() }
  },
    $(Label, { text: '+' })
  )

  private readonly group = $(GroupX, { gap: 2 })

  override init(): void {
    this.children = [$(Scroll, {},
      $(Border, { padding: 3 },
        this.group
      )
    )]

    this.sheet.$watch('sprites', sprites => {
      this.group.children = [
        ...sprites.map((spr, i) =>
          $(Button, {
            background: 0x99000099,
            padding: 3,
            $selected: this.sheet.$ref('current').adapt(c => c === i),
            onClick: () => {
              console.log(this.sheet.current)
              this.sheet.current = i
            }
          },
            $(SpriteThumb, { sprite: spr })
          )
        ),
        this.addButton
      ]

    })
  }

}

class SpriteThumb extends View {

  override passthrough: boolean = true

  sprite: Sprite = null!

  override init(): void {
    this.sprite.$watch('width', () => this.adjust())
    this.sprite.$watch('height', () => this.adjust())
  }

  override adjust(): void {
    this.w = this.sprite.width
    this.h = this.sprite.height
  }

  override background: number = 0xffffff33

}
