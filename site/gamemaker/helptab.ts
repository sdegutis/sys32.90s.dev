import { GroupX } from "../os/containers/group.js"
import { Label } from "../os/controls/label.js"
import { View } from "../os/core/view.js"
import { $ } from "../os/util/dyn.js"
import { centerLayout } from "../os/util/layouts.js"

export class DocsViewer extends View {

  override background = 0x000000ff

  override layout = centerLayout

  override init(): void {
    this.children = [
      $(GroupX, { gap: 1 },
        $(Label, { color: 0xffffffff, text: 'contact: ' }),
        $(Label, { color: 0xff9900ff, text: 'admin' }),
        $(Label, { color: 0xff0000ff, text: '@' }),
        $(Label, { color: 0xff0099ff, text: '90s.dev' }),
      )
    ]
  }

}
