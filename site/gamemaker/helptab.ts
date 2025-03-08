import { Label } from "../os/controls/label.js"
import { $, View } from "../os/core/view.js"
import { centerLayout } from "../os/util/layouts.js"

export class DocsViewer extends View {

  override background = 0x000000ff

  override layout = centerLayout

  override init(): void {
    this.children = [$(Label, { text: 'coming soon' })]
  }

}
