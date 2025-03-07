import { PanedYA } from "../os/containers/paned.js"
import { sys } from "../os/core/system.js"
import { type View } from "../os/core/view.js"
import type { Reactive } from "../os/util/events.js"

export class TabPane<Tab extends string> extends PanedYA {

  tabs!: Record<Tab, View>
  mine!: Reactive<Tab>
  menu!: View

  override init(): void {
    this.mine.watch(t => {
      this.children = [this.menu, this.tabs[t]]
      sys.layoutTree()
      sys.focus(this.tabs[t])
    })
  }

}
