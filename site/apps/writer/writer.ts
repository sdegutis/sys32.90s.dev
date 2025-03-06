import { TextArea } from "../../os/containers/textarea.js";
import { Panel } from "../../os/core/panel.js";
import { $ } from "../../os/core/view.js";
import { fs } from "../../os/fs/fs.js";

export default (filename?: string) => {

  const textarea = $(TextArea, {
    background: 0x00990033,
  });

  const s = filename ? fs.get(filename)! : 'foo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello worldfoo\nbar\n\nhello world';
  textarea.text = s
  // textarea.colors[10] = 0x0000ffff;
  // textarea.colors[5] = 0xffff0099;
  // textarea.colors.length = 0

  // textarea.color = 0x009999ff;

  const panel = $(Panel, { title: 'writer', w: 120, h: 100, },
    textarea
  );

  panel.show();

  textarea.focus();

};
