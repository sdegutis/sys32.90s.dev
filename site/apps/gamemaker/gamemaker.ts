import { TextArea } from "../../os/containers/textarea.js";
import { Panel } from "../../os/core/panel.js";
import { sys } from "../../os/core/system.js";
import { $, View } from "../../os/core/view.js";
import { makeVacuumLayout } from "../../os/util/layouts.js";

export default (filepath?: string) => {

  const textarea = $(TextArea, { background: 0x00007777 });
  const panel = $(Panel, { title: 'gamemaker', w: 120, h: 100, },
    $(View, {
      layout: makeVacuumLayout(),
      onKeyDown: key => {
        if (key === 'r' && sys.keys['Control']) { runGame(); return true; }
        if (key === 'Escape') { stopGame(); return true; }
        return false;
      },
    },
      textarea
    )
  );

  const gameView = $(View, { background: 0x000000ff, cursor: null });

  let gametick: (() => void) | undefined;

  async function runGame() {
    sys.enterFullscreen(gameView)


    const blob = new Blob([textarea.text], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob);
    const mod = await import(url);

    if (typeof mod.draw === 'function') {
      gametick = sys.onTick.watch(mod.draw);
    }
  }

  function stopGame() {
    gametick?.();
    sys.exitFullscreen()
  }

  textarea.text = ''

  panel.show();

  textarea.focus();

};
