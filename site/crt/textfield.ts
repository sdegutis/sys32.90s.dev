import { BorderBox } from "./box.js";
import { Font } from "./font.js";
import { Label } from "./label.js";
import { make } from "./screen.js";

export class TextField extends BorderBox {

  onEnter?(): void;
  onChange?(): void;

  length = 10;
  font = Font.crt2025;
  color = 0x000000ff;

  #text = make(this.screen, Label, { text: 'hi', padding: 0, border: 0x00000000 });
  #cursor = make(this.screen, Label, { text: '_', padding: 0, border: 0x00000000, color: 0x1177ffff });

  override children = [this.#text, this.#cursor];

  get text() { return this.#text.text; }
  set text(s: string) { this.#text.text = s; }

  override layout(): void {
    this.#text.x = this.padding;
    this.#text.y = this.padding;
    this.#cursor.x = this.padding;
    this.#cursor.y = this.padding;
  }

  override adjust(): void {
    const s = this.font.calcSize(' '.repeat(this.length));
    this.w = s.w + this.padding * 2;
    this.h = s.h + this.padding * 2;
  }

  override onKeyDown(key: string): void {
    if (key === 'Enter') {
      this.onEnter?.();
    }
    else if (key === 'Backspace') {
      // this.text = this.text.slice(0, -1);
      this.onChange?.();
    }
    else if (key.length === 1) {
      // this.text += key;
      this.onChange?.();
    }
    this.#restartBlinking();
  };

  #blink?: number;

  #restartBlinking() {
    this.#stopBlinking();
    this.#cursor.visible = true;
    this.#blink = setInterval(() => {
      this.#cursor.visible = !this.#cursor.visible;
      this.screen.needsRedraw = true;
    }, 500);
  }

  #stopBlinking() {
    this.#cursor.visible = false;
    clearInterval(this.#blink);
  }

  override onFocus(): void {
    this.#restartBlinking();
  }

  override onUnfocus(): void {
    this.#stopBlinking();
  }

}
