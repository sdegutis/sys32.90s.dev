import { PanedYA } from "../os/containers/paned.js"
import { SplitX } from "../os/containers/split.js"
import { sys } from "../os/core/system.js"
import { ws } from "../os/desktop/workspace.js"
import { $ } from "../os/util/dyn.js"
import { Reactive } from "../os/util/events.js"
import { CodeEditor } from "./codetab.js"
import { SpriteEditor } from "./gfxtab.js"
import { DocsViewer } from "./helptab.js"
import { MapEditor } from "./maptab.js"
import { Runner } from "./runner.js"
import { makeTabMenu, TabPane } from "./tabs.js"

const sample = `
export function draw() {
  //cls(0x99000099)
  drawrectf(0,0,20,20,0x99000099)
}
`

export default function gamemaker() {
  const codeEditor = $(CodeEditor, { text: sample.trimStart() })
  const spriteEditor = $(SpriteEditor)
  const mapEditor = $(MapEditor)
  const docsViewer = $(DocsViewer)

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

  const menus = $(SplitX, { $pos: split.$data('pos'), adjust() { this.h = this.firstChild!.h } },
    makeTabMenu(tabs, tab1, tab2),
    makeTabMenu(tabs, tab2, tab1),
  )

  const root = $(PanedYA, {}, menus, split)
  const runner = new Runner(codeEditor)

  sys.root.onKeyDown = key => {
    if (key === 'r' && sys.keys['Alt']) {
      runner.start()
      return true
    }
    if (key === 'D' && sys.keys['Alt']) {
      ws.showDesktop()
      return true
    }
    if (key === 'Escape') {
      runner.stop()
      return true
    }
    return false
  }

  sys.root.children = [root]
  sys.layoutTree()
  sys.focus(codeEditor)
}
