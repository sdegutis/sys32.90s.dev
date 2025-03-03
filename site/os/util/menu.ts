import { Border } from "../containers/border.js";
import { GroupY } from "../containers/group.js";
import { Button } from "../controls/button.js";
import { Label } from "../controls/label.js";
import { sys } from "../core/system.js";
import { $ } from "../core/view.js";

type MenuItem = { text: string, onClick: () => void };

export function showMenu(items: MenuItem[]) {
  const menu = $(Border, {
    x: sys.mouse.x,
    y: sys.mouse.y,
    padding: 2,
    background: 0x333333ff,
    passthrough: false,
    onBlur() { menu.remove() },
    onKeyDown() {
      menu.remove();
      return true;
    },
  },
    $(GroupY, { align: '-' },
      ...items.map(it => $(Button, { padding: 2, onClick: it.onClick },
        $(Label, { text: it.text })
      ))
    )
  );
  sys.root.addChild(menu);
  menu.focus();
  menu.layoutTree();
}
