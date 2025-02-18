import { BorderBox } from "./box.js";
import { Font } from "./font.js";

export class TextField extends BorderBox {

  text = '';
  length = 10;
  font = Font.crt2025;
  color = 0x000000ff;

  #cursor = 0;

  onEnter?(): void;
  onChange?(): void;

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
      this.onChange?.();
    }
    else if (key.length === 1) {
      this.text += key;
      this.onChange?.();
    }
    this.#restartBlinking();
  };

  override draw = () => {
    super.draw();

    // const vs = this.text.slice(this.#cursor, this.#cursor + this.length);
    // console.log(vs);

    this.screen.print(this.padding, this.padding, this.color, this.text);

    if (this.screen.focused === this) {
      if (this.#blinkShow) {
        let cx = this.padding + (this.font.width + 1) * this.text.length;
        let cy = this.padding;
        this.screen.print(cx, cy, 0x77aaffff, '_',);
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
