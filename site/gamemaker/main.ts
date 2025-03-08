import { PanedYA } from "../os/containers/paned.js"
import { SplitX } from "../os/containers/split.js"
import { sys } from "../os/core/system.js"
import { $, $$data, View } from "../os/core/view.js"
import { Reactive } from "../os/util/events.js"
import { makeVacuumLayout } from "../os/util/layouts.js"
import * as api from './api.js'
import { give } from "./bridge.js"
import { CodeEditor } from "./codeeditor.js"
import { DocsViewer } from "./docsviewer.js"
import { MapEditor } from "./mapeditor.js"
import { SpriteEditor } from "./spriteeditor.js"
import { makeTabMenu, TabPane } from "./tabs.js"

const prelude = `import {${Object.keys(api)}} from '${window.origin}/gamemaker/api.js'\n`

const sample = `
export function draw() {
  //cls()
  drawrectf(0,0,20,20,0x99000099)
}
`

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
    help: docsViewer,
  }

  const tab1 = new Reactive<Tab>('code')
  const tab2 = new Reactive<Tab>('gfx')

  const split = $(SplitX, { pos: 320 / 2, resizable: true },
    $((TabPane<Tab>), { mine: tab1, tabs }),
    $((TabPane<Tab>), { mine: tab2, tabs })
  )

  const menus = $(SplitX, { $pos: $$data(split, 'pos'), adjust() { this.h = this.firstChild!.h } },
    makeTabMenu(tabs, tab1, tab2),
    makeTabMenu(tabs, tab2, tab1),
  )

  const root = $(PanedYA, {}, menus, split)





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
