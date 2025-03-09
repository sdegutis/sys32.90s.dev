import { sys } from "../os/core/system.js"
import { View } from "../os/core/view.js"
import { $ } from "../os/util/dyn.js"
import * as api from './api.js'

const prelude = `import {${Object.keys(api)}} from '${window.origin}/gamemaker/api.js'\n`

export class Runner {

  editor: { text: string } & View
  removegametick: (() => void) | undefined
  running = false
  module: any

  gameView = $(View, {
    background: 0x000000ff,
    cursor: null,
    draw: () => this.draw(),
  })

  constructor(editor: { text: string } & View) {
    this.editor = editor
  }

  async start() {
    if (this.running) this.stop()
    this.running = true

    const blob = new Blob([prelude + this.editor.text], { type: 'application/javascript' })

    try {
      this.module = await import(URL.createObjectURL(blob))
    }
    catch (e) {
      this.fail(e)
      return
    }

    this.removegametick = sys.onTick.watch(() => this.tick())

    sys.root.addChild(this.gameView)
    sys.focus(this.gameView)
    sys.layoutTree()
  }

  stop() {
    if (!this.running) return
    this.running = false

    this.removegametick?.()
    this.gameView.remove()

    sys.layoutTree()
    sys.focus(this.editor)
  }

  private draw() {
    try {
      View.prototype.draw.call(this.gameView)
      this.module.draw?.()
      sys.needsRedraw = true
    } catch (e) { this.fail(e) }
  }

  private tick() {
    try {
      this.module.tick?.()
    } catch (e) { this.fail(e) }
  }

  private fail(e: any) {
    console.error(e)
    this.stop()
  }

}
