import { Scroll } from "../../os/containers/scroll.js";
import { TextArea } from "../../os/containers/textarea.js";
import { $, View } from "../../os/core/view.js";
import { Panel } from "../../os/core/panel.js";
import { makeVacuumLayout } from "../../os/util/layouts.js";
import { fs } from "../../os/fs/fs.js";

export default (filename?: string) => {

  const textarea = $(TextArea, { background: 0x00990033 });



  const s = filename ? fs.loadFile(filename)! : 'foo\nbar\n\nhello world';
  textarea.text = s.toLowerCase()
  // textarea.colors[10] = 0x0000ffff;
  // textarea.colors[5] = 0xffff0099;
  // textarea.colors.length = 0

  const panel = $(Panel, { title: 'writer', w: 70, h: 50, },
    $(View, { layout: makeVacuumLayout(), background: 0x44444433 },
      $(Scroll, { background: 0x0000ff11 },
        textarea
      )
    )
  );

  panel.show();

};
