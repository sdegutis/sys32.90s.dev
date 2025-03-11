import { Border } from "../containers/border.js"
import { GroupY } from "../containers/group.js"
import { Button } from "../controls/button.js"
import { Label } from "../controls/label.js"
import { crt } from "../core/crt.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { $ } from "./dyn.js"

export type MenuItem = '-' | { text: string, onClick: () => void }

export function showMenu(items: MenuItem[], adjust?: (menu: View) => void) {
  const menu = $(Border, {
    x: sys.mouse.x,
    y: sys.mouse.y,
    padding: 2,
    background: 0x333333ff,
    passthrough: false,
    onBlur() { menu.remove() },
    onKeyDown() { menu.remove(); return true },
  },
    $(GroupY, { align: '-' },
      ...items.map(it => it === '-'
        ? $(View, { h: 5, draw() { crt.rectFill(0, 2, this.w, 1, 0xffffff11) } })
        : $(Button, { padding: 2, onClick: it.onClick },
          $(Label, { text: it.text })
        )
      )
    )
  )

  if (menu.y + menu.h > sys.root.h) {
    menu.y = sys.mouse.y - menu.h
  }

  adjust?.(menu)

  console.log(menu)

  sys.root.addChild(menu)
  sys.focus(menu)
}
