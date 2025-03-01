import { View } from "../core/view.js"

export const passedFocus = {
  passthrough: false,
  onFocus(this: Partial<View>) { this.firstChild?.focus() },
}
