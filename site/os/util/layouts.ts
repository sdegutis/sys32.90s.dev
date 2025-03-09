import { View } from "../core/view.js"

export function vacuumAllLayout(this: View) {
  for (const c of this.children) {
    c.x = 0
    c.y = 0
    c.w = this.w
    c.h = this.h
  }
}

export function vacuumFirstLayout(this: View) {
  const c = this.firstChild
  if (c) {
    c.x = 0
    c.y = 0
    c.w = this.w
    c.h = this.h
  }
}

export function collapseAdjust(this: View) {
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
