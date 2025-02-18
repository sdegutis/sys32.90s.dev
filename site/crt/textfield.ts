import { BorderBox } from "./box.js";
import { Font } from "./font.js";

export class TextField extends BorderBox {

  text = '';
  length = 10;
  font = Font.crt2025;
  color = 0x000000ff;

  onEnter?(): void;

  override adjust(): void {
    const s = this.font.calcSize(' '.repeat(this.length));
    this.w = s.w + this.padding * 2;
    this.h = s.h + this.padding * 2;
  }

  override onScroll = (up: boolean) => {
    console.log('scrolling', up)
  };

  override onKeyDown = (key: string) => {
    if (key === 'Enter') {
      this.onEnter?.();
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1);
    }
    else {
      this.text += key;
    }
    this.#restartBlinking();
  };

  override draw = () => {
    this.screen.print(2, 2, this.color, this.text);

    if (this.screen.focused === this) {
      this.screen.rectLine(0, 0, this.w, this.h, 0xffffff33);

      if (this.#blinkShow) {
        let cx = 0;
        let cy = 0;

        for (let i = 0; i < this.text.length; i++) {
          const ch = this.text[i];
          if (ch === '\n') { cy++; cx = 0; continue; }
          cx++;
        }

        this.screen.print((cx * 4) + 2, (cy * 6) + 2, 0x77aaffff, '_');
      }
    }
  };

  #blink?: number;
  #blinkShow = false;

  #restartBlinking() {
    this.#stopBlinking();
    this.#blinkShow = true;
    this.#blink = setInterval(() => {
      this.#blinkShow = !this.#blinkShow;
      this.screen.needsRedraw = true;
    }, 500);
  }

  #stopBlinking() {
    clearInterval(this.#blink);
  }

  override onFocus = () => {
    this.#restartBlinking();
  };

  override onUnfocus = () => {
    this.#stopBlinking();
  };

}
