import { GroupX } from "./os/containers/group.js"
import { Button } from "./os/controls/button.js"
import { Label } from "./os/controls/label.js"
import { TextField } from "./os/controls/textfield.js"
import { sys } from "./os/core/system.js"
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

sys.root.layout = centerLayout.layout
sys.root.background = 0x000000ff
sys.root.childResized = centerLayout.childResized

let label
let field

let top = $(GroupX, { gap: 2, background: 0x000099ff },
  $(Button, { padding: 3, background: 0x009900ff },
    label = $(Label, { background: 0x990000ff, text: 'hey' })
  ),
  $(Button, { padding: 3, background: 0x000099ff },
    field = $(TextField, { background: 0x990000ff, text: 'hey' })
  ),
)

sys.root.addChild(top)

setTimeout(() => label.text = "hi\nho", 500)
setTimeout(() => field.length = 7, 1000)
