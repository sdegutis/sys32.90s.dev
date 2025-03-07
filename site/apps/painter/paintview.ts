import { Bitmap } from "../../os/core/bitmap.js"
import { crt } from "../../os/core/crt.js"
import { sys } from "../../os/core/system.js"
import { View } from "../../os/core/view.js"

export class PaintView extends View {

  showGrid = true

  width = 10
  height = 10

  zoom = 4

  color = 0xffffffff

  tool: 'pencil' | 'eraser' = 'pencil'

  override background = 0xffffff33
  override cursor = null

  private grid: number[] = []

  override adjust(): void {
    this.w = this.width * this.zoom
    this.h = this.height * this.zoom
  }

  override draw(): void {
    super.draw()

    if (this.showGrid) {
      for (let x = 0; x < this.width; x++) {
        crt.rectFill(x * this.zoom, 0, 1, this.h, 0x00000033)
      }
      for (let y = 0; y < this.height; y++) {
        crt.rectFill(0, y * this.zoom, this.w, 1, 0x00000033)
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x
        const c = this.grid[i]
        if (c !== undefined) {
          const px = x * this.zoom
          const py = y * this.zoom
          crt.rectFill(px, py, this.zoom, this.zoom, c)
        }
      }
    }

    if (this.hovered) {
      const px = Math.floor(this.mouse.x / this.zoom) * this.zoom
      const py = Math.floor(this.mouse.y / this.zoom) * this.zoom
      crt.rectFill(px, py, this.zoom, this.zoom, 0x0000ff77)
    }
  }

  override onMouseDown(button: number): void {
    if (button !== 0) {
      const x = Math.floor(this.mouse.x / this.zoom)
      const y = Math.floor(this.mouse.y / this.zoom)
      const i = y * this.width + x
      let colorUnderMouse = this.grid[i]
      if (colorUnderMouse === undefined) colorUnderMouse = 0x00000000
      this.color = colorUnderMouse
      return
    }

    if (this.tool === 'pencil' || this.tool === 'eraser') {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / this.zoom)
          const y = Math.floor(this.mouse.y / this.zoom)
          const i = y * this.width + x
          this.grid[i] = this.tool === 'pencil' ? this.color : 0x00000000
        }
      })
    }
  }

  loadBitmap(s: string) {
    const b = Bitmap.fromString(s)
    this.resize(b.width, b.height)

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x
        const ci = b.pixels[i]
        if (ci > 0) {
          const c = b.colors[ci - 1]
          this.grid[i] = c
        }
      }
    }
  }

  toBitmap() {
    const colors: number[] = []
    const pixels: number[] = []
    const map = new Map<number, number>()
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = this.grid[y * this.width + x]
        if (c === undefined) {
          pixels.push(0)
        }
        else {
          let index = map.get(c)
          if (!index) map.set(c, index = colors.push(c))
          pixels.push(index)
        }
      }
    }
    return new Bitmap(colors, this.width, pixels)
  }

  resize(width: number, height: number) {
    const oldgrid = [...this.grid]
    const oldwidth = this.width
    const oldheight = this.height

    this.width = width
    this.height = height
    this.grid.length = 0

    for (let y = 0; y < Math.min(height, oldheight); y++) {
      for (let x = 0; x < Math.min(width, oldwidth); x++) {
        const c = oldgrid[y * oldwidth + x]
        if (c !== undefined) this.grid[y * width + x] = c
      }
    }

    sys.layoutTree(this.parent!)
  }

}
