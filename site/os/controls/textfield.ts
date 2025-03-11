import { crt34 } from "../core/font.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { $ } from "../util/dyn.js"
import { Label } from "./label.js"

export class TextField extends View {

  onEnter?(): void
  onChange?(): void

  private _field = $(Label, { text: '' })
  private _cursor = $(Label, { visible: false, text: '_' })

  text = ''
  length = 10
  font = crt34
  color = this._field.color
  cursorColor = 0x1177ffff

  private showText() {
    if (this.focused) {
      this._field.text = this.text.slice(-this.length + 1)
    }
    else {
      this._field.text = this.text.slice(0, this.length)
    }
  }

  override init(): void {
    this._field.$ref('color', this.$ref('color'))
    this._cursor.$ref('color', this.$ref('cursorColor'))
    this.font = crt34
    this._field.$ref('font', this.$ref('font'))
    this._cursor.$ref('font', this.$ref('font'))
    this.children = [this._field, this._cursor]
    this.$watch('text', s => this.showText())
    this.$watch('length', s => this.adjust())
  }

  override layout(): void {
    this._field.x = 0
    this._field.y = 0
    this._cursor.x = (this._cursor.w + 1) * this._field.text.length
    this._cursor.y = 0
  }

  override adjust(): void {
    this.w = this.font.width * this.length + (this.font.xgap * (this.length - 1))
    this.h = this.font.height
  }

  override onKeyDown(key: string): boolean {
    if (key === 'v' && sys.keys['Control']) {
      navigator.clipboard.readText().then(s => {
        this.text += s
        this.onChange?.()
      })
      this.restartBlinking()
      return true
    }
    else if (key === 'c' && sys.keys['Control']) {
      navigator.clipboard.writeText(this.text)
      this.restartBlinking()
      return true
    }
    else if (key === 'Enter') {
      this.onEnter?.()
      this.restartBlinking()
      return true
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1)
      this.onChange?.()
      this.restartBlinking()
      return true
    }
    else if (key.length === 1) {
      this.text += key
      this.onChange?.()
      this.restartBlinking()
      return true
    }
    return false
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
    this.showText()
  }

  override onBlur(): void {
    this.stopBlinking()
    this.showText()
  }

}
