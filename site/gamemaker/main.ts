import { PanedYA } from "../os/containers/paned.js"
import { SplitX } from "../os/containers/split.js"
import { TextArea } from "../os/containers/textarea.js"
import { Label } from "../os/controls/label.js"
import { sys } from "../os/core/system.js"
import { $, $data, View } from "../os/core/view.js"
import { Reactive } from "../os/util/events.js"
import { centerLayout, makeVacuumLayout } from "../os/util/layouts.js"
import * as api from './api.js'
import { give } from "./bridge.js"
import { makeTabMenu, TabPane } from "./tabs.js"

const prelude = `import {${Object.keys(api)}} from '${window.origin}/gamemaker/api.js'\n`

const sample = `
export function draw() {
  //cls()
  drawrectf(0,0,20,20,0x99000099)
}
`

const highlightings: Record<string, [number, RegExp]> = {
  keyw: [0xff00ffcc, /(export|function|let|const)/g],
  punc: [0xffffff77, /([(){}=,])/g],
  call: [0x0099ffff, /([a-zA-Z.]+)\(/g],
  spcl: [0xcccc00ff, new RegExp(`(${[...Object.keys(api).reverse(), 'draw', 'tick'].join('|')})`, 'g')],
  nums: [0x00ffffff, /(0x[0-9a-fA-F]+|[0-9.]+)/g],
  cmnt: [0x33ff3377, /(\/\/.+)/g],
}

class CodeEditor extends View {

  private textarea = $(TextArea, {
    background: 0x112244ff,
    highlightings
  })

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

  override background = 0x000000ff

}

class MapEditor extends View {

  override background = 0x000000ff

}

class DocsViewer extends View {

  override background = 0x000000ff

  override layout = centerLayout

  override init(): void {
    this.children = [$(Label, { text: 'coming soon' })]
  }

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
    help: docsViewer,
  }

  const tab1 = new Reactive<Tab>('code')
  const tab2 = new Reactive<Tab>('gfx')

  const menus = $(SplitX, { adjust() { this.h = this.firstChild!.h } },
    makeTabMenu(tabs, tab1, tab2),
    makeTabMenu(tabs, tab2, tab1),
  )

  const split = $(SplitX, { pos: 320 / 2, resizable: true },
    $((TabPane<Tab>), { mine: tab1, tabs }),
    $((TabPane<Tab>), { mine: tab2, tabs })
  )

  $data(split, 'pos').watch(pos => {
    menus.pos = pos
    sys.layoutTree()
  })

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
