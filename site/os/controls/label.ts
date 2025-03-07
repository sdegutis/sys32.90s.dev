import { crt34 } from "../core/font.js"
import { $data, View } from "../core/view.js"

export class Label extends View {

  text = ''
  font = crt34
  color = 0xffffffff
  override passthrough = true

  lines: string[] = []

  override init(): void {
    this.font = crt34
    $data(this, 'text').watch(t => {
      this.lines = t.split('\n')
    })
  }

  override adjust(): void {
    let w = 0
    for (const line of this.lines) {
      if (line.length > w) w = line.length
    }
    this.w = w * this.font.width + (w - 1) * this.font.xgap
    this.h = (this.lines.length * this.font.height) + ((this.lines.length - 1) * this.font.ygap)
  }

  override draw() {
    super.draw()

    this.font.print(0, 0, this.color, this.text)
  }

}
