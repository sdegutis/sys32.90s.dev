import { Border } from "../containers/border.js"
import { GroupX, GroupY } from "../containers/group.js"
import { Button } from "../controls/button.js"
import { Label } from "../controls/label.js"
import { TextField } from "../controls/textfield.js"
import { $ } from "../core/dyn.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { centerLayout } from "./layouts.js"
import { dragMove } from "./selections.js"
import { passedFocus } from "./unsure.js"

function expandToFitContainer(this: View) {
  this.x = 0
  this.y = 0
  this.w = this.parent!.w
  this.h = this.parent!.h
}

export async function showPrompt(text: string) {
  const p = Promise.withResolvers<string>()

  const dialog = $(Border, {
    padding: 1, borderColor: 0x99000099, passthrough: false, onMouseDown: () => {
      const move = dragMove(dialog)
      sys.trackMouse({ move })
    }
  },
    $(Border, { padding: 3, background: 0x000000ff },
      $(GroupY, { gap: 3, align: 'a', },
        $(Label, { text }),
        $(Border, { padding: 2, background: 0x222222ff, ...passedFocus },
          $(TextField, { id: 'field', onEnter: accept, })
        ),
        $(GroupX, { gap: 2 },
          $(Button, { padding: 3, onClick: accept }, $(Label, { text: 'ok' })),
          $(Button, { padding: 3, onClick: cancel }, $(Label, { text: 'cancel' }))
        )
      )
    )
  )

  const overlay = $(View, {
    adjust: expandToFitContainer,
    layout: centerLayout,
    background: 0x00000033,
    onKeyDown(key) {
      if (key === 'Escape') { cancel(); return true }
      return false
    },
    onMouseDown: cancel,
  },
    dialog
  )

  function accept() { p.resolve(dialog.find<TextField>('field')!.text) }
  function cancel() { p.resolve('') }

  sys.root.addChild(overlay)
  sys.focus(dialog.find('field')!)
  sys.layoutTree(overlay)

  p.promise.then(() => overlay.remove())

  return p.promise
}

export async function showConfirm(text: string) {
  const p = Promise.withResolvers<boolean>()

  const dialog = $(Border, {
    padding: 1, borderColor: 0x99000099, passthrough: false, onMouseDown: () => {
      const move = dragMove(dialog)
      sys.trackMouse({ move })
    }
  },
    $(Border, { padding: 3, background: 0x000000ff },
      $(GroupY, { gap: 3, align: 'a', },
        $(Label, { text }),
        $(GroupX, { gap: 2 },
          $(Button, { padding: 3, onClick: accept }, $(Label, { text: 'yes' })),
          $(Button, { padding: 3, onClick: cancel }, $(Label, { text: 'no' }))
        )
      )
    )
  )

  const overlay = $(View, {
    adjust: expandToFitContainer,
    layout: centerLayout,
    background: 0x00000033,
    onKeyDown(key) {
      if (key === 'Escape') { cancel(); return true }
      if (key === 'Enter') { accept(); return true }
      return false
    },
    onMouseDown: cancel,
  },
    dialog
  )

  function accept() { p.resolve(true) }
  function cancel() { p.resolve(false) }

  sys.root.addChild(overlay)
  sys.focus(dialog)
  sys.layoutTree(overlay)

  p.promise.then(() => overlay.remove())

  return p.promise
}
