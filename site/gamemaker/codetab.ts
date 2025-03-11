import { TextArea } from "../os/containers/textarea.js"
import { sys } from "../os/core/system.js"
import { View } from "../os/core/view.js"
import { $ } from "../os/util/dyn.js"
import { vacuumFirstLayout } from "../os/util/layouts.js"
import * as api from './api.js'

const highlightings: Record<string, [number, RegExp]> = {
  keyw: [0xff00ffcc, /(export|function|let|const)/g],
  punc: [0xffffff77, /([(){}=,])/g],
  call: [0x0099ffff, /([a-zA-Z.]+)\(/g],
  spcl: [0xcccc00ff, new RegExp(`(${[...Object.keys(api).reverse(), 'draw', 'tick'].join('|')})`, 'g')],
  nums: [0x00ffffff, /(0x[0-9a-fA-F]+|[0-9.]+)/g],
  cmnt: [0x33ff3377, /(\/\/.+)/g],
}

export class CodeEditor extends View {

  private textarea = $(TextArea, {
    background: 0x112244ff,
    highlightings
  })

  get text() { return this.textarea.text }
  set text(s: string) { this.textarea.text = s }

  override layout = vacuumFirstLayout

  override init(): void {
    this.children = [this.textarea]
  }

  override onFocus(): void {
    sys.focus(this.textarea)
  }

}
