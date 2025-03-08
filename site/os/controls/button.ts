import { Border } from "../containers/border.js"
import { sys } from "../core/system.js"
import { $, View } from "../core/view.js"
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
  private counter = new ClickCounter()

  hoverColor = 0xffffff22
  pressColor = 0xffffff11

  override passthrough = false

  overlay = $(View, {
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
  }

  private changebg: Reactive<any> | undefined

  override adopted(): void {
    this.changebg = multiplex({
      pressed: this.$data('pressed'),
      hovered: this.$data('hovered'),
    })

    this.changebg.watch(data => {
      let c = 0x00000000
      if (data.pressed) c = this.pressColor
      else if (data.hovered) c = this.hoverColor
      this.overlay.background = c
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
