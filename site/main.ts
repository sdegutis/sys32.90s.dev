import gamemaker from "./gamemaker/main.js"
import { ws } from "./os/desktop/workspace.js"

await ws.addProgram("filer", import.meta.resolve("./apps/filer/"))
await ws.addProgram("settings", import.meta.resolve("./apps/settings/"))
await ws.addProgram("mapmaker", import.meta.resolve("./apps/mapmaker/"))
await ws.addProgram("gamemaker", import.meta.resolve("./apps/gamemaker/"))
await ws.addProgram("painter", import.meta.resolve("./apps/painter/"))
await ws.addProgram("writer", import.meta.resolve("./apps/writer/"))
await ws.addProgram("fontmaker", import.meta.resolve("./apps/fontmaker/"))

// ws.showDesktop()

// ws.launch('gamemaker')

gamemaker()
