import { Scroll } from "../sys32/containers/scroll.js";
import { TextArea } from "../sys32/containers/textarea.js";
import type { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { makeVacuumLayout } from "../sys32/util/layouts.js";

export default (sys: System) => {

  const { $ } = sys;

  const textarea = $(TextArea, { background: 0x00990033 });

  textarea.text = 'foo\nbar\n\nhello world'
  textarea.colors[10] = 0x0000ffff;
  textarea.colors[5] = 0xffff0099;
  // textarea.colors.length = 0

  const panel = $(Panel, { title: 'writer', w: 70, h: 50, },
    $(View, { layout: makeVacuumLayout(), background: 0x44444433 },
      $(Scroll, { background: 0x0000ff11 },
        textarea
      )
    )
  );

  sys.root.addChild(panel);

};
