import { GroupX } from "../os/containers/group.js"
import { PanedYA } from "../os/containers/paned.js"
import { SplitX } from "../os/containers/split.js"
import { TextArea } from "../os/containers/textarea.js"
import { Button } from "../os/controls/button.js"
import { Label } from "../os/controls/label.js"
import { sys } from "../os/core/system.js"
import { $, View } from "../os/core/view.js"
import { makeVacuumLayout } from "../os/util/layouts.js"
import * as api from './api.js'
import { give } from "./bridge.js"

const prelude = `import {${Object.keys(api)}} from '${window.origin}/gamemaker/api.js'\n`

const sample = `
export function draw() {
  drawrectf(0,0,20,20,0x99000099)
}
`

export default function gamemaker() {

  const textarea = $(TextArea, { background: 0x000077ff, text: sample.trimStart() })

  const spriteEditor = $(View, { background: 0x99000099 })

  const menu1 = $(GroupX, { background: 0x333333ff }, $(Button, { padding: 2 }, $(Label, { text: 'foo' })))
  const menu2 = $(GroupX, { background: 0x333333ff }, $(Button, { padding: 2 }, $(Label, { text: 'bar' })))

  sys.layoutTree(menu1)
  sys.layoutTree(menu2)

  const pane1 = $(PanedYA, {}, menu1, textarea)
  const pane2 = $(PanedYA, {}, menu2, spriteEditor)

  const root = $(SplitX, { pos: 320 / 2 }, pane1, pane2)

  let _draw: (() => void) | undefined
  const draw = () => { _draw?.(); sys.needsRedraw = true }

  const gameView = $(View, { background: 0x000000ff, cursor: null, draw })

  let gametick: (() => void) | undefined

  let running = false

  async function runGame() {
    if (running) return

    give(textarea.text.toUpperCase())

    sys.root.children = [gameView]
    sys.focus(gameView)
    sys.layoutTree()

    running = true

    const blob = new Blob([prelude + textarea.text], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const mod = await import(url)

    _draw = mod.draw

    if (typeof mod.tick === 'function') {
      gametick = sys.onTick.watch(mod.tick)
    }
  }

  function stopGame() {
    if (!running) return
    _draw = undefined
    gametick?.()
    sys.root.children = [root]
    sys.focus(textarea)
    sys.layoutTree()
    running = false
  }

  sys.root.onKeyDown = key => {
    if (key === 'r' && sys.keys['Control']) { runGame(); return true }
    if (key === 'Escape') { stopGame(); return true }
    return false
  }

  sys.root.layout = makeVacuumLayout()
  sys.root.children = [root]
  sys.layoutTree()
  sys.focus(textarea)
}
