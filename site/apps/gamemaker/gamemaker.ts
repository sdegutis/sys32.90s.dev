import { TextArea } from "../../os/containers/textarea.js";
import { crt } from "../../os/core/crt.js";
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

  const gameView = $(View, { background: 0x000000ff, cursor: null });

  let gametick: (() => void) | undefined;

  let running = false;

  async function runGame() {
    if (running) return

    sys.enterFullscreen(gameView)

    running = true;

    const blob = new Blob([textarea.text], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob);
    const mod = await import(url);

    if (typeof mod.draw === 'function') {
      gametick = sys.onTick.watch(mod.draw.bind({
        rectfill: (x: number, y: number, w: number, h: number, c: number) => crt.rectFill(x, y, w, h, c),
      }));
    }
  }

  function stopGame() {
    if (!running) return
    gametick?.();
    sys.exitFullscreen()
    running = false
  }

  textarea.text = ''

  panel.show();

  textarea.focus();

  sys.enterFullscreen(editorView)

};
