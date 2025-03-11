import { Label } from "../controls/label.js"

export class Clock extends Label {

  override init(): void {
    let timer: ReturnType<typeof setInterval> | undefined = undefined
    this.$watch('parent', (p) => {
      clearInterval(timer)
      if (p) {
        timer = setInterval((() => this.updateTime()), 1000)
      }
    })
    this.updateTime()
  }

  updateTime() {
    this.text = new Date().toLocaleTimeString('en-us')
  }

  // override draw(): void {
  //   super.draw()

  //   crt.raw = true
  //   crt.rectFill(10, 2, 200, 100, 0x0000ff88)
  //   crt.raw = false
  // }

}
