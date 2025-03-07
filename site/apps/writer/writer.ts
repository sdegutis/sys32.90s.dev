import { TextArea } from "../../os/containers/textarea.js";
import { Panel } from "../../os/desktop/panel.js";
import { sys } from "../../os/core/system.js";
import { $ } from "../../os/core/view.js";
import { fs } from "../../os/fs/fs.js";
import { showPrompt } from "../../os/util/dialog.js";
import { Reactive } from "../../os/util/events.js";
import { showMenu } from "../../os/util/menu.js";

function makeFilePanel(opts: {
  panel: Panel;
  filepath: string | undefined;
  loadData(s: string): void;
  saveData(): string;
}) {
  const panel = opts.panel;
  const title = panel.title;
  const file = new Reactive(opts.filepath);

  panel.onMenu = function doMenu() {
    showMenu([
      { text: 'load', onClick: loadFile },
      { text: 'save', onClick: saveFile },
    ])
  };

  file.watch(s => {
    panel.title = !s ? `${title}:[no file]` : `${title}:${s}`;
    sys.layoutTree(panel);
  });

  if (file.data) {
    const s = fs.get(file.data);
    if (s) {
      opts.loadData(s);
    }
  }

  async function loadFile() {
    const s = await showPrompt('file path?');
    if (!s) return;
    file.update(s);

    const data = fs.get(file.data!);
    if (data) {
      opts.loadData(data);
    }
  }

  async function saveFile() {
    if (!file.data) {
      const s = await showPrompt('file path?');
      if (!s) return;
      file.update(s);
    }
    fs.put(file.data!, opts.saveData());
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

}

export default (filepath?: string) => {

  const textarea = $(TextArea, { background: 0x00007777 });
  const panel = $(Panel, { title: 'writer', w: 120, h: 100, }, textarea);

  makeFilePanel({
    filepath,
    panel,
    loadData: s => textarea.text = s,
    saveData: () => textarea.text,
  });

  panel.show();

  sys.focus(textarea);

};
