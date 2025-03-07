import { GroupX } from "../os/containers/group.js"
import { PanedYA } from "../os/containers/paned.js"
import { SplitX } from "../os/containers/split.js"
import { TextArea } from "../os/containers/textarea.js"
import { Button } from "../os/controls/button.js"
import { Label } from "../os/controls/label.js"
import { sys } from "../os/core/system.js"
import { $, View } from "../os/core/view.js"
import { Reactive } from "../os/util/events.js"
import { makeVacuumLayout } from "../os/util/layouts.js"
import * as api from './api.js'
import { give } from "./bridge.js"

const prelude = `import {${Object.keys(api)}} from '${window.origin}/gamemaker/api.js'\n`

const sample = `
export function draw() {
  drawrectf(0,0,20,20,0x99000099)
}
`

class TabPane<Tab extends string> extends PanedYA {

  tabs!: Record<Tab, View>

  mine!: Reactive<Tab>
  other!: Reactive<Tab>

  override init(): void {
    const menu = $(GroupX, { background: 0x333333ff },
      ...Object.keys(this.tabs).map((text) => {
        return $(Button, {
          padding: 2,
          onClick: () => {
            const tab = text as Tab
            if (this.other.data === tab) {
              this.other.update(this.mine.data)
            }
            this.mine.update(tab)
          }
        },
          $(Label, { text }))
      })
    )

    this.mine.watch(t => {
      this.children = [menu, this.tabs[t]]
      sys.layoutTree()
      sys.focus(this.tabs[t])
    })
  }

}

class CodeEditor extends View {

  textarea = $(TextArea, { background: 0x000077ff })

  get text() { return this.textarea.text }
  set text(s: string) { this.textarea.text = s }

  override layout = makeVacuumLayout()

  override init(): void {
    this.children = [this.textarea]
  }

  override onFocus(): void {
    sys.focus(this.textarea)
  }

}

class SpriteEditor extends View {

  override background = 0x770000ff

}

class MapEditor extends View {

  override background = 0x330000ff

}

class DocsViewer extends View {

  override background = 0x007700ff

}

export default function gamemaker() {

  const codeEditor = $(CodeEditor, { text: sample.trimStart() })
  const spriteEditor = $(SpriteEditor, {})
  const mapEditor = $(MapEditor, {})
  const docsViewer = $(DocsViewer, {})

  type Tab = keyof typeof tabs
  const tabs = {
    code: codeEditor,
    gfx: spriteEditor,
    map: mapEditor,
    docs: docsViewer,
  }

  const tab1 = new Reactive<Tab>('code')
  const tab2 = new Reactive<Tab>('gfx')

  const pane1 = $(TabPane<Tab>, { tabs, mine: tab1, other: tab2 })
  const pane2 = $(TabPane<Tab>, { tabs, mine: tab2, other: tab1 })

  const root = $(SplitX, { pos: 320 / 2 }, pane1, pane2)








  let _draw: (() => void) | undefined
  const draw = () => {
    _draw?.()
    sys.needsRedraw = true
  }

  const gameView = $(View, { background: 0x000000ff, cursor: null, draw })

  let gametick: (() => void) | undefined

  let running = false

  async function runGame() {
    if (running) return

    give(codeEditor.text.toUpperCase())

    sys.root.children = [gameView]
    sys.focus(gameView)
    sys.layoutTree()

    running = true

    const blob = new Blob([prelude + codeEditor.text], { type: 'application/javascript' })
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
    sys.focus(codeEditor)
    sys.layoutTree()
    running = false
  }

  sys.root.onKeyDown = key => {
    if (key === 'r' && sys.keys['Control']) {
      runGame()
      return true
    }
    if (key === 'Escape') {
      stopGame()
      return true
    }
    return false
  }

  sys.root.layout = makeVacuumLayout()
  sys.root.children = [root]
  sys.layoutTree()
  sys.focus(codeEditor)
}
