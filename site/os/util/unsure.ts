import { sys } from "../core/system.js"
import { View } from "../core/view.js"

export const passedFocus = {
  passthrough: false,
  onFocus(this: Partial<View>) { this.firstChild && sys.focus(this.firstChild) },
}
