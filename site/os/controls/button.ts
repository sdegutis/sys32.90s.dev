import { Border } from "../containers/border.js"
import { sys } from "../core/system.js"
import { $ } from "../core/view.js"
import { multiplex, Reactive } from "../util/events.js"

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

  overlay = $(Border, {
    passthrough: true,
    layout() {
      if (!this.parent) return
      this.x = this.y = 0
      this.w = this.parent.w
      this.h = this.parent.h
    },
  })

  onClick?(click: { button: number, count: number }): void

  override init(): void {
    this.addChild(this.overlay)
    this.overlay.$data('padding', this.$data('padding'))
  }

  private changebg: Reactive<any> | undefined

  override adopted(): void {
    this.changebg = multiplex({
      pressed: this.$data('pressed'),
      hovered: this.$data('hovered'),
      selected: this.$data('selected'),
    })

    this.changebg.watch(data => {
      if (data.selected) this.overlay.background = this.selectedBackground
      else if (data.pressed) this.overlay.background = this.pressBackground
      else if (data.hovered) this.overlay.background = this.hoverBackground
      else this.overlay.background = 0x00000000

      if (data.selected) this.overlay.borderColor = this.selectedBorderColor
      else if (data.pressed) this.overlay.borderColor = this.pressBorderColor
      else if (data.hovered) this.overlay.borderColor = this.hoverBorderColor
      else this.overlay.borderColor = 0x00000000
    })
  }

  override abandoned(): void {
    this.changebg?.destroy()
    this.changebg = undefined
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
