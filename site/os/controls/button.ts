import { Border } from "../containers/border.js"
import { sys } from "../core/system.js"
import { $ } from "../util/dyn.js"

export class ClickCounter {

  count = 0
  private clear!: ReturnType<typeof setTimeout>
  private sec: number

  constructor(sec = 333) {
    this.sec = sec
  }

  increase() {
    this.count++
    clearTimeout(this.clear)
    this.clear = setTimeout(() => this.count = 0, this.sec)
  }

}

class Overlay extends Border {

  override passthrough = true

  override layout() {
    if (!this.parent) return
    this.x = this.y = 0
    this.w = this.parent.w
    this.h = this.parent.h
  }

}

export class Button extends Border {

  pressed = false
  selected = false

  hoverBackground = 0xffffff22
  pressBackground = 0xffffff11
  selectedBackground = 0xffffff33

  hoverBorderColor = 0x00000000
  pressBorderColor = 0x00000000
  selectedBorderColor = 0x00000000

  private counter = new ClickCounter()

  override passthrough = false

  overlay = $(Overlay)

  onClick?(click: { button: number, count: number }): void

  override init(): void {
    this.addChild(this.overlay)
    this.overlay.$ref('padding', this.$ref('padding'))

    this.$watch('pressed', () => this.changeBackground())
    this.$watch('hovered', () => this.changeBackground())
    this.$watch('selected', () => this.changeBackground())
  }

  private changeBackground() {
    if (this.selected) {
      this.overlay.background = this.selectedBackground
      this.overlay.borderColor = this.selectedBorderColor
    }
    else if (this.pressed) {
      this.overlay.background = this.pressBackground
      this.overlay.borderColor = this.pressBorderColor
    }
    else if (this.hovered) {
      this.overlay.background = this.hoverBackground
      this.overlay.borderColor = this.hoverBorderColor
    }
    else {
      this.overlay.background = 0x00000000
      this.overlay.borderColor = 0x00000000
    }
  }

  override onMouseDown(button: number): void {
    this.pressed = true
    this.counter.increase()
    const cancel = sys.trackMouse({
      move: () => {
        if (!this.hovered) {
          this.pressed = false
          cancel()
        }
      },
      up: () => {
        this.pressed = false
        this.onClick?.({ button, count: this.counter.count })
      },
    })
  }

}
