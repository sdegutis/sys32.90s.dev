import { sys } from "../os/core/system.js"
import { View } from "../os/core/view.js"
import type { Reactive } from "../os/util/events.js"
import { makeVacuumLayout } from "../os/util/layouts.js"

export class TabPane<Tab extends string> extends View {

  override layout = makeVacuumLayout()

  tabs!: Record<Tab, View>
  mine!: Reactive<Tab>

  override init(): void {
    this.mine.watch(t => {
      this.children = [this.tabs[t]]
      sys.layoutTree()
      sys.focus(this.tabs[t])
    })
  }

}
