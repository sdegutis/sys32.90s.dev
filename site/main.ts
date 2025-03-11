import { ws } from "./os/desktop/workspace.js"

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
// sys.root.background = 0x000000ff
// sys.root.childResized = centerLayout.childResized

// let label
// let border

// border = $(Border, {},
//   label = $(Label, { background: 0x990000ff, text: 'hey' })
// )

// sys.root.addChild(border)

// console.log(border)
// console.log(label)

// setTimeout(() => label.text = "hi", 500)
