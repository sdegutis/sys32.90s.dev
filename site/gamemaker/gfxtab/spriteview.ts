import { GroupX } from "../../os/containers/group.js"
import { Scroll } from "../../os/containers/scroll.js"
import { View } from "../../os/core/view.js"
import { $ } from "../../os/util/dyn.js"
import type { Sprite, Spritesheet } from "./spritesheet.js"

export class SpriteView extends View {

  sheet!: Spritesheet
  sprite!: Sprite

  private readonly group = $(GroupX, {})
  override children = [$(Scroll, {}, this.group)]

  override init(): void {
    this.sheet.$ref('sprite', this.sheet.$ref('sprite'))
  }

}
