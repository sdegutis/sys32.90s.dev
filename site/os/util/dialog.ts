import { Border } from "../containers/border.js";
import { GroupX, GroupY } from "../containers/group.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { TextField } from "../controls/textfield.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { centerLayout } from "./layouts.js";
import { passedFocus } from "./unsure.js";

function expandToFitContainer(this: View) {
  this.x = 0;
  this.y = 0;
  this.w = this.parent!.w;
  this.h = this.parent!.h;
}

export async function showPrompt(text: string) {
  const p = Promise.withResolvers<string>();

  const dialog = $(View, {
    adjust: expandToFitContainer,
    layout: centerLayout,
    background: 0x00000033,
    onKeyDown(key) {
      if (key === 'Escape') { cancel(); return true; }
      return false;
    }
  },
    $(Border, { all: 1, borderColor: 0x99000099, passthrough: false },
      $(Border, { all: 3, background: 0x000000ff },
        $(GroupY, { gap: 3, align: 'a', },
          $(Label, { text }),
          $(Border, { all: 2, background: 0x222222ff, ...passedFocus },
            $(TextField, { id: 'field', onEnter: accept, })
          ),
          $(GroupX, { gap: 2 },
            $(Button, { all: 3, onClick: accept }, $(Label, { text: 'ok' })),
            $(Button, { all: 3, onClick: cancel }, $(Label, { text: 'cancel' })),
          )
        )
      )
    )
  );

  function accept() { p.resolve(dialog.find<TextField>('field')!.text); }
  function cancel() { p.resolve(''); }

  sys.root.addChild(dialog);
  dialog.find('field')!.focus();
  dialog.layoutTree();

  p.promise.then(() => dialog.remove());

  return p.promise;
}
