import { View } from "../core/view.js"

export const passedFocus: Partial<View> = {
  passthrough: false,
  onFocus() { this.firstChild?.focus() },
}
