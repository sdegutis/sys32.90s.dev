import { GroupX, GroupY } from "./os/containers/group.js"
import { SplitY } from "./os/containers/split.js"
import { Button } from "./os/controls/button.js"
import { ImageView } from "./os/controls/image.js"
import { Label } from "./os/controls/label.js"
import { Slider } from "./os/controls/slider.js"
import { TextField } from "./os/controls/textfield.js"
import { Bitmap } from "./os/core/bitmap.js"
import { sys } from "./os/core/system.js"
import { View } from "./os/core/view.js"
import { ws } from "./os/desktop/workspace.js"
import { $ } from "./os/util/dyn.js"
import { centerLayout } from "./os/util/layouts.js"

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
  $(GroupX, { gap: 2, background: 0x000099ff },
    $(Button, { padding: 3, background: 0x000099ff },
      field = $(TextField, { background: 0x990000ff, text: 'hey' })
    ),
    $(GroupY, {},
      $(Button, { padding: 3, background: 0x009900ff },
        label = $(Label, { background: 0x990000ff, text: 'hey' })
      ),
      $(Slider, { w: 20, knobSize: 4 }),
      image = $(ImageView, { image: axeImage })
    ),
  ),
  $(View, { ...centerLayout, background: 0x003300ff },
    $(Label, { text: 'second pane' })
  )
)

console.log(top)

sys.root.addChild(top)

setTimeout(() => label.text = "hi\nho", 500)
setTimeout(() => field.length = 7, 1000)
setTimeout(() => image.image = adjImage, 1500)
setTimeout(() => top.pos = 50, 2000)
