import { crt34 } from "../core/font.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { $ } from "../util/dyn.js"
import { vacuumFirstLayout } from "../util/layouts.js"
import { Scroll } from "./scroll.js"

export class TextArea extends View {

  font = crt34
  color = 0xffffffff
  private lines: string[] = ['']

  private scroll!: Scroll
  private label!: View
  private _cursor!: View

  get text() { return this.lines.join('\n') }
  set text(s: string) {
    this.lines = s.split('\n')
    this.highlight()
    this.row = Math.min(this.row, this.lines.length - 1)
    this.fixCol()
    this.layoutTree()
  }

  highlightings: Record<string, [number, RegExp]> = {}

  cursorColor = 0x0000FF99

  row = 0
  col = 0
  end = 0

  override layout = vacuumFirstLayout

  private colors: number[][] = []

  highlight() {
    this.colors.length = this.lines.length
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i]
      const cline = Array(line.length).fill(this.color)
      this.colors[i] = cline
      for (const [col, regex] of Object.values(this.highlightings)) {
        for (const m of line.matchAll(regex)) {
          cline.fill(col, m.index, m.index + m[1].length)
        }
      }
    }
  }

  override init(): void {
    this.children = [
      this.scroll = $(Scroll, {
        onMouseDown: (key) => this.onMouseDown(key),
      },
        this.label = $(View, {
          adjust: () => { this.adjustTextLabel() },
          draw: () => { this.drawTextLabel() },
          onMouseDown: (key) => this.onMouseDown(key),
        },
          this._cursor = $(View, {
            onMouseDown: (key) => this.onMouseDown(key),
            visible: false,
            w: this.font.width + this.font.xgap,
            h: this.font.height + this.font.ygap,
          })
        )
      )
    ]

    this.reflectCursorPos()
    this.$watch('cursorColor', c => this._cursor.background = c)

    this.adjustTextLabel()
  }

  layoutTree() {
    this.adjustTextLabel()
  }

  override onMouseDown(button: number): void {
    sys.focus(this)

    let x = this.mouse.x - this.label.x
    let y = this.mouse.y - this.label.y

    const row = Math.floor(y / (this.font.height + this.font.ygap))
    const col = Math.floor(x / (this.font.width + this.font.xgap))

    this.row = Math.min(row, this.lines.length - 1)
    this.end = this.col = col
    this.fixCol()
    this.restartBlinking()
    this.reflectCursorPos()
    this.scrollCursorIntoView()
    this.layoutTree()
  }

  private drawTextLabel() {
    for (let y = 0; y < this.lines.length; y++) {
      const line = this.lines[y]
      const py = y * this.font.height + y * this.font.ygap
      for (let x = 0; x < line.length; x++) {
        const char = this.font.chars[line[x]]
        const px = x * this.font.width + x * this.font.xgap
        char.draw(px, py, this.colors[y][x])
      }
    }
  }

  private adjustTextLabel() {
    if (!this.label) { return }

    let w = 0
    for (const line of this.lines) {
      if (line.length > w) w = line.length
    }
    this.label.w = w * this.font.width + (w - 1) * this.font.xgap
    this.label.h = (this.lines.length * this.font.height) + ((this.lines.length - 1) * this.font.ygap)
    this.label.w += this.font.width + this.font.xgap
  }

  private reflectCursorPos() {
    this._cursor.x = (this.col * this.font.xgap + this.col * this.font.width) - Math.floor(this.font.xgap / 2)
    this._cursor.y = (this.row * this.font.ygap + this.row * this.font.height) - Math.floor(this.font.ygap / 2)
  }

  private scrollCursorIntoView() {
    let x = this._cursor.x
    let y = this._cursor.y

    let node = this._cursor
    while (node !== this.scroll) {
      node = node.parent!
      x += node.x
      y += node.y
    }

    if (y < 0) {
      this.scroll.scrolly -= -y
      this.layoutTree()
    }

    if (x < 0) {
      this.scroll.scrollx -= -x
      this.layoutTree()
    }

    const maxy = this.scroll.h - this._cursor.h
    if (y > maxy) {
      this.scroll.scrolly -= maxy - y
      this.layoutTree()
    }

    const maxx = this.scroll.w - this._cursor.w
    if (x > maxx) {
      this.scroll.scrollx -= maxx - x
      this.layoutTree()
    }
  }

  override onKeyDown(key: string): boolean {
    if (key === 'Home') {
      const firstNonSpace = this.lines[this.row].match(/[^\s]/)?.index ?? 0
      if (sys.keys['Control']) {
        this.row = 0
        this.end = this.col = 0
      }
      else if (this.col !== firstNonSpace) {
        this.end = this.col = firstNonSpace
      }
      else {
        this.end = this.col = 0
      }
    }
    else if (key === 'End') {
      if (sys.keys['Control']) {
        this.row = this.lines.length - 1
        this.col = this.end = this.lines[this.row].length
      }
      else {
        this.end = this.col = this.lines[this.row].length
      }
    }
    else if (key === 'ArrowRight') {
      if (this.col < this.lines[this.row].length) {
        this.end = this.col = this.col + 1
      }
      else if (this.row < this.lines.length - 1) {
        this.col = this.end = 0
        this.row++
      }
    }
    else if (key === 'ArrowLeft') {
      if (this.col > 0) {
        this.end = this.col = this.col - 1
      }
      else if (this.row > 0) {
        this.row--
        this.end = this.col = this.lines[this.row].length
      }
    }
    else if (key === 'ArrowDown') {
      this.row = Math.min(this.row + 1, this.lines.length - 1)
      this.fixCol()
    }
    else if (key === 'ArrowUp') {
      this.row = Math.max(0, this.row - 1)
      this.fixCol()
    }
    else if (key === 'Tab') {
      const [a, b] = this.halves()
      this.lines[this.row] = a + '  ' + b
      this.col += 2
      this.end = this.col
      this.layoutTree()
    }
    else if (key === 'Backspace') {
      if (this.col > 0) {
        const [a, b] = this.halves()
        if (a === ' '.repeat(a.length) && a.length >= 2) {
          this.lines[this.row] = a.slice(0, -2) + b
          this.col -= 2
          this.end = this.col
          this.layoutTree()
        }
        else {
          this.lines[this.row] = a.slice(0, -1) + b
          this.col--
          this.end = this.col
          this.layoutTree()
        }
      }
      else if (this.row > 0) {
        this.end = this.lines[this.row - 1].length
        this.lines[this.row - 1] += this.lines[this.row]
        this.lines.splice(this.row, 1)
        this.row--
        this.col = this.end
        this.layoutTree()
      }
    }
    else if (key === 'Delete') {
      if (this.col < this.lines[this.row].length) {
        const [a, b] = this.halves()
        this.lines[this.row] = a + b.slice(1)
        this.layoutTree()
      }
      else if (this.row < this.lines.length - 1) {
        this.lines[this.row] += this.lines[this.row + 1]
        this.lines.splice(this.row + 1, 1)
        this.layoutTree()
      }
    }
    else if (key === 'Enter') {
      const [a, b] = this.halves()
      this.lines[this.row] = a
      this.lines.splice(++this.row, 0, b)
      this.end = this.col = 0
      this.layoutTree()
    }
    else if (key.length === 1 && !sys.keys['Control'] && !sys.keys['Alt']) {
      const [a, b] = this.halves()
      this.lines[this.row] = a + key + b
      this.col++
      this.end = this.col
      this.layoutTree()
    }
    else {
      return false
    }

    this.highlight()
    this.restartBlinking()
    this.reflectCursorPos()
    this.scrollCursorIntoView()
    return true
  }

  private halves() {
    let line = this.lines[this.row]
    const first = line.slice(0, this.col)
    const last = line.slice(this.col)
    return [first, last] as const
  }

  private fixCol() {
    this.col = Math.min(this.lines[this.row].length, this.end)
  }

  private blink?: ReturnType<typeof setInterval>

  private restartBlinking() {
    this.stopBlinking()
    this._cursor.visible = true
    this.blink = setInterval(() => {
      this._cursor.visible = !this._cursor.visible
      sys.needsRedraw = true
    }, 500)
  }

  private stopBlinking() {
    this._cursor.visible = false
    clearInterval(this.blink)
  }

  override onFocus(): void {
    this.restartBlinking()
  }

  override onBlur(): void {
    this.stopBlinking()
  }

}
