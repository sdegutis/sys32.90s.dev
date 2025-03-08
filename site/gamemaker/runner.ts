import { sys } from "../os/core/system.js"
import { $, View } from "../os/core/view.js"
import * as api from './api.js'

const prelude = `import {${Object.keys(api)}} from '${window.origin}/gamemaker/api.js'\n`

export class Runner {

  editor: { text: string } & View
  removegametick: (() => void) | undefined
  running = false
  _draw: (() => void) | undefined
  gameView = $(View, {
    background: 0x000000ff,
    cursor: null,
    draw: () => this.draw(),
  })

  constructor(editor: { text: string } & View) {
    this.editor = editor
  }

  draw() {
    this._draw?.()
    sys.needsRedraw = true
  }

  async start() {
    if (this.running) return

    sys.root.addChild(this.gameView)
    sys.focus(this.gameView)
    sys.layoutTree()

    this.running = true

    const blob = new Blob([prelude + this.editor.text], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const mod = await import(url)

    this._draw = mod.draw

    if (typeof mod.tick === 'function') {
      this.removegametick = sys.onTick.watch(mod.tick)
    }
  }

  stop() {
    if (!this.running) return
    this._draw = undefined
    this.removegametick?.()
    this.gameView.remove()
    sys.focus(this.editor)
    sys.layoutTree()
    this.running = false
  }

}
