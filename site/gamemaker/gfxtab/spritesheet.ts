import { $, Addressable } from "../../os/util/dyn.js"
import { multiplex } from "../../os/util/events.js"
import type { Color } from "./palettes.js"

export class Spritesheet extends Addressable {

  sprites: Sprite[] = [$(Sprite)]
  current = 0

  color: Color = { p: 'vinik24', i: 8 }

  sprite: Sprite = null!

  override init(): void {
    this.$ref('sprite', multiplex({
      sprites: this.$ref('sprites'),
      current: this.$ref('current'),
    }).adapt(d => d.sprites[d.current]))
  }

  changeColorBy(n: number) {
    let i = this.color.i + n
    if (i < 0) i = 23
    if (i > 23) i = 0
    this.color = { p: this.color.p, i }
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
