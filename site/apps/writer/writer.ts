import { TextArea } from "../../os/containers/textarea.js";
import { Panel } from "../../os/core/panel.js";
import { sys } from "../../os/core/system.js";
import { $ } from "../../os/core/view.js";
import { fs } from "../../os/fs/fs.js";
import { showPrompt } from "../../os/util/dialog.js";
import { Reactive } from "../../os/util/events.js";
import { showMenu } from "../../os/util/menu.js";

export default (filepath?: string) => {

  const filesource = new Reactive(filepath);

  const textarea = $(TextArea, { background: 0x00007777 });
  const panel = $(Panel, { title: 'writer', w: 120, h: 100, }, textarea);



  function loadData(s: string) {
    textarea.text = s;
  }

  function saveData(): string {
    return textarea.text;
  }

  panel.onMenu = function doMenu() {
    showMenu([
      { text: 'load', onClick: loadFile },
      { text: 'save', onClick: saveFile },
    ])
  }


  filesource.watch(s => {
    panel.title = !s ? `painter:[no file]` : `painter:${s}`;
    panel.layoutTree();
  });

  if (filesource.data) {
    const s = fs.get(filesource.data);
    if (s) {
      loadData(s);
    }
  }

  async function loadFile() {
    const s = await showPrompt('file path?');
    if (!s) return;
    filesource.update(s);

    const data = fs.get(filesource.data!);
    if (data) {
      loadData(data);
    }
  }

  async function saveFile() {
    if (!filesource.data) {
      const s = await showPrompt('file path?');
      if (!s) return;
      filesource.update(s);
    }
    fs.put(filesource.data!, saveData());
  }

  panel.onKeyDown = (key) => {
    if (key === 'o' && sys.keys['Control']) {
      loadFile();
      return true;
    }
    else if (key === 's' && sys.keys['Control']) {
      saveFile();
      return true;
    }
    return false;
  };




  panel.show();

  textarea.focus();

};
