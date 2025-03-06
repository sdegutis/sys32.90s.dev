import { TextArea } from "../../os/containers/textarea.js";
import { Panel } from "../../os/core/panel.js";
import { $ } from "../../os/core/view.js";
import { fs } from "../../os/fs/fs.js";

export default (filename?: string) => {

  const textarea = $(TextArea, {
    background: 0x00007777,
  });

  const s = filename ? fs.get(filename)! : 'foo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello world';
  textarea.text = s

  const panel = $(Panel, { title: 'writer', w: 120, h: 100, },
    textarea
  );

  panel.show();

  textarea.focus();

};
