import { Reactive } from "../../os/util/events.js"

export class EditableMap {

  currentTool = new Reactive(5)

  width: number
  height: number

  terrain: number[] = []
  units: number[] = []

  constructor(w: number, h: number) {
    this.width = w
    this.height = h
    this.terrain = Array(this.width * this.height).fill(3)
    this.units = Array(this.width * this.height).fill(0)


  }

  useTool(tx: number, ty: number) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return
    const ti = ty * this.width + tx
    this.terrain[ti] = this.currentTool.data
  }

}
