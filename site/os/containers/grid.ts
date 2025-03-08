import { View } from "../core/view.js"

export class GridX extends View {

  cols = 10
  gap = 0

  private get rows() { return Math.ceil(this.children.length / this.cols) }

  override adjust(): void {
    const c = this.firstChild!
    const rows = this.rows
    const cols = this.cols
    this.w = cols * c.w + this.gap * (cols - 1)
    this.h = rows * c.h + this.gap * (rows - 1)
  }

  override layout(): void {
    const c = this.firstChild!
    const rows = this.rows
    const cols = this.cols

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        const child = this.children[i]
        if (!child) return
        child.x = x * c.w + this.gap * x
        child.y = y * c.h + this.gap * y
      }
    }
  }

}
