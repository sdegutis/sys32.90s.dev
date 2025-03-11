import { Border } from "./os/containers/border.js"
import { GridX } from "./os/containers/grid.js"
import { GroupY } from "./os/containers/group.js"
import { SpacedX } from "./os/containers/spaced.js"
import { SplitY } from "./os/containers/split.js"
import { TextArea } from "./os/containers/textarea.js"
import { Button } from "./os/controls/button.js"
import { ImageView } from "./os/controls/image.js"
import { Label } from "./os/controls/label.js"
import { Slider } from "./os/controls/slider.js"
import { TextField } from "./os/controls/textfield.js"
import { Bitmap } from "./os/core/bitmap.js"
import { sys } from "./os/core/system.js"
import { ws } from "./os/desktop/workspace.js"
import { $ } from "./os/util/dyn.js"

await ws.addProgram("filer", import.meta.resolve("./apps/filer/"))
await ws.addProgram("settings", import.meta.resolve("./apps/settings/"))
await ws.addProgram("mapmaker", import.meta.resolve("./apps/mapmaker/"))
await ws.addProgram("painter", import.meta.resolve("./apps/painter/"))
await ws.addProgram("writer", import.meta.resolve("./apps/writer/"))
await ws.addProgram("fontmaker", import.meta.resolve("./apps/fontmaker/"))

// gamemaker()

// ws.showDesktop()
// ws.launch('painter')

// sys.root.layout = centerLayout.layout
sys.root.background = 0x000000ff

let label
let field
let image

const axeImage = new Bitmap([0x333333ff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const adjImage = new Bitmap([0xffffff77], 2, [1, 0, 1, 1,])

let top = $(SplitY, { background: 0x222222ff, pos: 40 },
  $(SpacedX, { background: 0x000099ff },
    $(Button, { padding: 3, background: 0x000099ff },
      field = $(TextField, { background: 0x990000ff, text: 'hey' })
    ),
    $(Border, { padding: 3, background: 0x00000033 },
      $(GridX, { cols: 3, gap: 3, },
        ...Array(10).keys().map(i =>
          $(Border, { padding: 3 },
            $(Label, { text: 'mid ' + i, background: 0xffffff33 })
          )
        )
      )
    ),
    $(GroupY, {},
      $(Button, { padding: 3, background: 0x009900ff },
        label = $(Label, { background: 0x990000ff, text: 'hey' })
      ),
      $(Slider, { w: 20, knobSize: 4 }),
      image = $(ImageView, { image: axeImage })
    ),
  ),
  $(TextArea, { background: 0x003300ff, text: 'hey\n\nworld' },

  )
)

console.log(top)

sys.root.addChild(top)

setTimeout(() => { console.log('a'); label.text = "hi\nho" }, 500)
setTimeout(() => { console.log('a'); field.length = 7 }, 1000)
setTimeout(() => { console.log('a'); image.image = adjImage }, 1500)
setTimeout(() => { console.log('a'); top.pos = 50 }, 2000)
