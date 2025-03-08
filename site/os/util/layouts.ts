import { View } from "../core/view.js"

export function vacuumAllLayout(this: View) {
  for (const c of this.children) {
    c.x = 0
    c.y = 0
    c.w = this.w
    c.h = this.h
  }
}

export function makeVacuumLayout(padding = 0) {
  return function (this: View) {
    const c = this.firstChild
    if (c) {
      c.x = padding
      c.y = padding
      c.w = this.w - padding * 2
      c.h = this.h - padding * 2
    }
  }
}

export function makeCollapseAdjust(this: View) {
  this.w = this.firstChild?.w ?? 0
  this.h = this.firstChild?.h ?? 0
}

export function centerLayout(this: View) {
  const c = this.firstChild
  if (c) {
    c.x = Math.round(this.w / 2 - c.w / 2)
    c.y = Math.round(this.h / 2 - c.h / 2)
  }
}

export function makeFlowLayout(padding = 0, gap = 0) {
  return function (this: View) {
    let x = padding
    let y = padding
    let h = 0
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]

      if (x + child.w > this.w && i > 0) {
        x = padding
        y += h + gap
        h = 0
      }

      child.x = x
      child.y = y
      x += child.w + gap
      if (child.h > h) h = child.h
    }
  }
}

export function makeFlowLayoutY(padding = 0, gap = 0) {
  return function (this: View) {
    let x = padding
    let y = padding
    let h = 0

    const dw = 'h'
    const dh = 'w'
    const dx = 'y'
    const dy = 'x'

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]

      if (x + child[dw] > this[dw] && i > 0) {
        x = padding
        y += h + gap
        h = 0
      }

      child[dx] = x
      child[dy] = y
      x += child[dw] + gap
      if (child[dh] > h) h = child[dh]
    }
  }
}
