import { TextArea } from "../../os/containers/textarea.js";
// import * from "../../os/core/crt.js";
import { Panel } from "../../os/core/panel.js";
import { sys } from "../../os/core/system.js";
import { $, View } from "../../os/core/view.js";
import { makeVacuumLayout } from "../../os/util/layouts.js";

export default (filepath?: string) => {

  const textarea = $(TextArea, { background: 0x000077ff });
  const editorView = $(View, {
    layout: makeVacuumLayout(),
    onKeyDown: key => {
      if (key === 'r' && sys.keys['Control']) { runGame(); return true; }
      if (key === 'Escape') { stopGame(); return true; }
      return false;
    },
  },
    textarea
  );

  const panel = $(Panel, { title: 'gamemaker', w: 120, h: 100, },
    editorView
  );

  let _draw: (() => void) | undefined;
  function draw() {
    _draw?.();
  }

  const gameView = $(View, { background: 0x000000ff, cursor: null, draw });

  let gametick: (() => void) | undefined;

  let running = false;

  async function runGame() {
    if (running) return

    editorView.parent!.children = [gameView]

    running = true;

    const prelude = `import {crt} from '${window.origin}/os/core/crt.js';\n`;
    const blob = new Blob([prelude + textarea.text], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob);
    const mod = await import(url);

    _draw = mod.draw;

    if (typeof mod.tick === 'function') {
      gametick = sys.onTick.watch(mod.tick);
    }
  }

  function stopGame() {
    if (!running) return
    _draw = undefined;
    gametick?.();
    gameView.parent!.children = [editorView]
    running = false
  }

  textarea.text = `
export function draw() {
  crt.rectFill(0,0,20,20,0x99000099)
}
`.trimStart();

  panel.show();

  sys.focus(textarea);

  // sys.enterFullscreen(editorView)

};
