import { View } from "../core/view.js"

export const vacuumAllLayout = {
  layout(this: View) {
    for (const c of this.children) {
      c.x = 0
      c.y = 0
      c.w = this.w
      c.h = this.h
    }
  }
}

export const vacuumFirstLayout = {
  layout(this: View) {
    const c = this.firstChild
    if (c) {
      c.x = 0
      c.y = 0
      c.w = this.w
      c.h = this.h
    }
  }
}

export const centerLayout = {
  layout(this: View) {
    const c = this.firstChild
    if (c) {
      c.x = Math.round(this.w / 2 - c.w / 2)
      c.y = Math.round(this.h / 2 - c.h / 2)
    }
  }
}