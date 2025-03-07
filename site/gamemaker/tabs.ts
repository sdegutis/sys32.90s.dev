import { GroupX } from "../os/containers/group.js"
import { PanedYA } from "../os/containers/paned.js"
import { Button } from "../os/controls/button.js"
import { Label } from "../os/controls/label.js"
import { sys } from "../os/core/system.js"
import { type View, $ } from "../os/core/view.js"
import type { Reactive } from "../os/util/events.js"

export class TabPane<Tab extends string> extends PanedYA {

  tabs!: Record<Tab, View>

  mine!: Reactive<Tab>
  other!: Reactive<Tab>

  override init(): void {
    const menu = $(GroupX, { background: 0x333333ff },
      ...Object.keys(this.tabs).map((text) => {
        return $(Button, {
          padding: 2,
          onClick: () => {
            const tab = text as Tab
            if (this.other.data === tab) {
              this.other.update(this.mine.data)
            }
            this.mine.update(tab)
          }
        },
          $(Label, { text }))
      })
    )

    this.mine.watch(t => {
      this.children = [menu, this.tabs[t]]
      sys.layoutTree()
      sys.focus(this.tabs[t])
    })
  }

}
