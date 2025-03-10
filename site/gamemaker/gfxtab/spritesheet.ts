import { $, Addressable } from "../../os/util/dyn.js"
import { multiplex } from "../../os/util/events.js"

export class Spritesheet extends Addressable {

  sprites: Sprite[] = [$(Sprite)]
  current = 0

  sprite: Sprite = null!

  override init(): void {
    this.$ref('sprite', multiplex({
      sprites: this.$ref('sprites'),
      current: this.$ref('current'),
    }).adapt(d => d.sprites[d.current]))
  }

}

export class Sprite extends Addressable {

  width = 8
  height = 8

  images: SpriteImage[] = [
    $(SpriteImage, { sprite: this })
  ]

  override init(): void {
    this.$watch('images', images => {
      for (const image of images) {
        image.sprite = this
      }
    })
  }

}

export class SpriteImage extends Addressable {

  sprite!: Sprite

  override init(): void {
    this.$watch('sprite', s => {
    })
  }

}
