import { GridX } from "../../os/containers/grid.js"
import { GroupX, GroupY } from "../../os/containers/group.js"
import { PanedXB, PanedYB } from "../../os/containers/paned.js"
import { Scroll } from "../../os/containers/scroll.js"
import { SpacedX } from "../../os/containers/spaced.js"
import { Button } from "../../os/controls/button.js"
import { Label } from "../../os/controls/label.js"
import { Slider } from "../../os/controls/slider.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { Panel } from "../../os/desktop/panel.js"
import { fs } from "../../os/fs/fs.js"
import { showPrompt } from "../../os/util/dialog.js"
import { makeStripeDrawer } from "../../os/util/draw.js"
import { $ } from "../../os/util/dyn.js"
import { Reactive } from "../../os/util/events.js"
import { showMenu } from "../../os/util/menu.js"
import { PaintView } from "./paintview.js"
import { ResizerView } from "./resizer.js"

export default (filepath?: string) => {

  const filesource = new Reactive(filepath)

  const $zoom = new Reactive(4)

  let widthLabel: Label
  let heightLabel: Label
  let colorLabel: Label
  let zoomLabel: Label

  let paintView: PaintView

  let toolArea: View
  let pencilTool: View
  let eraserTool: View

  const panel = $(Panel, { title: 'painter', minw: 50, w: 180, h: 120, onMenu: () => doMenu() },
    $(PanedXB, { gap: 1 },
      $(PanedYB, { gap: 1 },
        $(Scroll, { background: 0x222222ff, draw: makeStripeDrawer(), },
          paintView = $(PaintView, { color: COLORS[3], $zoom }),
          $(ResizerView<PaintView>)
        ),
        $(SpacedX, {},
          $(GroupX, {},
            $(Label, { color: 0xffffff33, text: 'w:' }), widthLabel = $(Label, { $text: paintView.$ref('width').adapt(n => n.toString()) }),
            $(Label, { color: 0xffffff33, text: ' h:' }), heightLabel = $(Label, { $text: paintView.$ref('height').adapt(n => n.toString()) }),
            $(Label, { color: 0xffffff33, text: ' c:' }), colorLabel = $(Label),
            $(Label, { color: 0xffffff33, text: ' z:' }), zoomLabel = $(Label, { $text: paintView.$ref('zoom').adapt(n => n.toString()) }),
          ),
          $(GroupX, { gap: 1 },
            $(Button, { onClick() { paintView.showGrid = !paintView.showGrid } },
              $(Label, { text: 'grid' })
            ),
            $(Slider, { knobSize: 3, w: 20, min: 1, max: 12, $val: $zoom })
          )
        )
      ),

      $(GroupY, { align: 'a', gap: 2 },

        $(GroupX, {},
          pencilTool = $(Button, { onClick: () => { paintView.tool = 'pencil' } }, $(View, { passthrough: true, w: 4, h: 4 })),
          eraserTool = $(Button, { onClick: () => { paintView.tool = 'eraser' } }, $(View, { passthrough: true, w: 4, h: 4 })),
        ),

        $(GroupX, {},
          $(Button, { padding: 2, onClick: () => { addColor() } }, $(Label, { text: '+' })),
        ),

        toolArea = $(GridX, { cols: 3, background: 0x99000033, }),

      )

    ),
  )

  paintView.$watch('tool', t => pencilTool.background = t === 'pencil' ? 0xffffffff : 0x333333ff)
  paintView.$watch('tool', t => eraserTool.background = t === 'eraser' ? 0xffffffff : 0x333333ff)

  paintView.$watch('width', () => panel.layoutTree())
  paintView.$watch('height', () => panel.layoutTree())

  async function addColor() {
    const colorCode = await showPrompt('enter color code:')
    const color = parseInt('0x' + colorCode, 16)
    makeColorButton(color)
  }

  const colorsWithButtons = new Set<number>()

  function makeColorButton(color: number) {
    colorsWithButtons.add(color)
    toolArea.addChild($(Button, {
      padding: 1,
      $selected: paintView.$ref('color').adapt(c => c === color),
      onClick: () => { paintView.color = color }
    },
      $(View, { passthrough: true, w: 4, h: 4, background: color, })
    ))
  }

  for (const color of COLORS) {
    makeColorButton(color)
  }

  paintView.$watch('color', color => colorLabel.text = '0x' + color.toString(16).padStart(8, '0'))

  function doMenu() {
    showMenu([
      { text: 'load', onClick: loadFile },
      { text: 'save', onClick: saveFile },
    ])
  }

  filesource.watch(s => {
    panel.title = !s ? `painter:[no file]` : `painter:${s}`
  })

  if (filesource.data) {
    const s = fs.get(filesource.data)
    if (s) {
      paintView.loadBitmap(s)
    }
  }

  async function loadFile() {
    const s = await showPrompt('file path?')
    if (!s) return
    filesource.update(s)

    const data = fs.get(filesource.data!)!
    paintView.loadBitmap(data)
  }

  async function saveFile() {
    if (!filesource.data) {
      const s = await showPrompt('file path?')
      if (!s) return
      filesource.update(s)
    }
    fs.put(filesource.data!, paintView.toBitmap().toString())
  }

  panel.onKeyDown = (key) => {
    if (key === 'o' && sys.keys['Control']) {
      loadFile()
      return true
    }
    else if (key === 's' && sys.keys['Control']) {
      saveFile()
      return true
    }
    return false
  }

  paintView.$watch('color', color => {
    if (!colorsWithButtons.has(color)) {
      makeColorButton(color)
    }
  })

  panel.show()
}






// const COLORS = [
//   0x1a1c2cff, 0x5d275dff, 0xb13e53ff, 0xef7d57ff,
//   0xffcd75ff, 0xa7f070ff, 0x38b764ff, 0x257179ff,
//   0x29366fff, 0x3b5dc9ff, 0x41a6f6ff, 0x73eff7ff,
//   0xf4f4f4ff, 0x94b0c2ff, 0x566c86ff, 0x333c57ff,
// ]

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
]
