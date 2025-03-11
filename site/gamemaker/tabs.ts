import { GroupX } from "../os/containers/group.js"
import { Button } from "../os/controls/button.js"
import { Label } from "../os/controls/label.js"
import { sys } from "../os/core/system.js"
import { View } from "../os/core/view.js"
import { $ } from "../os/util/dyn.js"
import type { Reactive } from "../os/util/events.js"
import { vacuumFirstLayout } from "../os/util/layouts.js"

export function makeTabMenu<Tab extends string>(
  tabs: Record<Tab, View>,
  tab1: Reactive<Tab>,
  tab2: Reactive<Tab>,
) {
  return $(GroupX, { background: 0x333333ff },
    ...Object.keys(tabs).map((text) => {
      const button = $(Button, {
        padding: 2,
        onClick: () => {
          const tab = text as Tab
          if (tab2.data === tab) {
            tab2.update(tab1.data)
          }
          tab1.update(tab)
        }
      },
        $(Label, { text })
      )

      tab1.watch(t => {
        const selected = t === text
        button.background = selected ? 0xffffff33 : 0x00000000
      })

      return button
    })
  )
}

export class TabPane<Tab extends string> extends View {

  override layout = vacuumFirstLayout.layout

  tabs!: Record<Tab, View>
  mine!: Reactive<Tab>

  override init(): void {
    this.mine.watch(t => {
      this.children = [this.tabs[t]]
      sys.focus(this.tabs[t])
    })
  }

}
