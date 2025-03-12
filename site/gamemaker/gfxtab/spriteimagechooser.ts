import { Border } from "../../os/containers/border.js"
import { GroupX } from "../../os/containers/group.js"
import { Scroll } from "../../os/containers/scroll.js"
import { Button } from "../../os/controls/button.js"
import { Label } from "../../os/controls/label.js"
import { View } from "../../os/core/view.js"
import { $ } from "../../os/util/dyn.js"
import { vacuumFirstLayout } from "../../os/util/layouts.js"
import type { Sprite, SpriteImage, Spritesheet } from "./spritesheet.js"

export class SpriteImageChooser extends View {

  sheet!: Spritesheet
  sprite: Sprite = null!

  private addButton = $(Button, {
    padding: 3,
    onClick: () => { this.sprite.addImage() }
  },
    $(Label, { text: '+' })
  )

  private readonly group = $(GroupX, { gap: 2 })

  override layout = vacuumFirstLayout
  // override background: number = 0x003300ff

  override init(): void {
    this.$ref('sprite', this.sheet.$ref('sprite'))
    this.children = [$(Scroll, {},
      $(Border, { padding: 3 },
        this.group
      )
    )]

    this.$watch('sprite', sprite => sprite.$watch('images', (images) => {
      this.group.children = [
        ...images.map((im, i) =>
          $(Button, {
            padding: 3,
            $selected: this.sprite.$ref('current').adapt(c => c === i),
            onClick: () => { this.sprite.current = i }
          },
            $(SpriteImageThumb, { sprite: im.sprite, image: im })
          )
        ),
        this.addButton
      ]
    }))
  }

}

class SpriteImageThumb extends View {

  sprite: Sprite = null!
  image: SpriteImage = null!

  override passthrough: boolean = true

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
