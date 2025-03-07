import { crt } from "../../os/core/crt.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"
import { TileSelection, dragMove } from "../../os/util/selections.js"
import type { EditableMap } from "./map.js"
import { COLORS } from "./mapcolors.js"

export class MapView extends View {

  showGrid = true
  map!: EditableMap

  private drawTerrain: ((x: number, y: number) => void)[] = []
  private tilesel: TileSelection | null = null

  override cursor = null

  override init(): void {
    for (let i = 0; i < 16; i++) {
      this.drawTerrain.push((x, y) => {
        crt.rectFill(x, y, 4, 4, COLORS[i])
      })
    }

    this.drawTerrain.push((x, y) => {
      crt.rectFill(x, y, 4, 4, COLORS[3])
    })

    this.w = this.map.width * 4
    this.h = this.map.height * 4
  }

  override onMouseDown(): void {
    if (sys.keys[' ']) {
      sys.trackMouse({ move: dragMove(this) })
    }
    else if (sys.keys['Control']) {
      this.tilesel = new TileSelection(this, 4)

      sys.trackMouse({
        move: () => {
          this.tilesel!.update()

          const tx1 = Math.max(this.tilesel!.tx1, 0)
          const ty1 = Math.max(this.tilesel!.ty1, 0)
          const tx2 = Math.min(this.tilesel!.tx2, this.map.width)
          const ty2 = Math.min(this.tilesel!.ty2, this.map.height)

          for (let y = ty1; y < ty2; y++) {
            for (let x = tx1; x < tx2; x++) {
              this.map.useTool(x, y)
            }
          }

        },
        up: () => {
          this.tilesel = null
        },
      })
    }
    else if (sys.keys['Alt']) {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / 4)
          const y = Math.floor(this.mouse.y / 4)
          this.map.useTool(x + 0, y + 0)
          this.map.useTool(x + 1, y + 0)
          this.map.useTool(x - 1, y + 0)
          this.map.useTool(x + 0, y + 1)
          this.map.useTool(x + 0, y - 1)
        },
      })
    }
    else {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / 4)
          const y = Math.floor(this.mouse.y / 4)
          this.map.useTool(x, y)
        },
      })
    }

  }

  override draw(): void {
    // for (let i = 0; i < 300; i++)
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const i = y * this.map.width + x
        const t = this.map.terrain[i]
        this.drawTerrain[t](x * 4, y * 4)
      }
    }

    if (this.showGrid) {
      for (let x = 0; x < this.map.width; x++) {
        crt.rectFill(x * 4, 0, 1, this.map.height * 4, 0x00000011)
      }

      for (let y = 0; y < this.map.height; y++) {
        crt.rectFill(0, y * 4, this.map.width * 4, 1, 0x00000011)
      }
    }

    if (this.hovered) {
      const tx = Math.floor(this.mouse.x / 4)
      const ty = Math.floor(this.mouse.y / 4)
      crt.rectFill(tx * 4, ty * 4, 4, 4, 0x0000ff77)

      if (sys.keys['Alt']) {
        crt.rectFill((tx + 0) * 4, (ty + 1) * 4, 4, 4, 0x0000ff77)
        crt.rectFill((tx + 0) * 4, (ty - 1) * 4, 4, 4, 0x0000ff77)
        crt.rectFill((tx + 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77)
        crt.rectFill((tx - 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77)
      }
    }

    if (this.tilesel) {
      const { tx1, tx2, ty1, ty2 } = this.tilesel

      crt.rectLine(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33)
      crt.rectFill(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33)
    }

    // crt.rectFill(this.mouse.x, this.mouse.y - 2, 1, 5, 0x00000077)
    // crt.rectFill(this.mouse.x - 2, this.mouse.y, 5, 1, 0x00000077)
    // crt.pset(this.mouse.x, this.mouse.y, 0xffffffff)

  }

}
