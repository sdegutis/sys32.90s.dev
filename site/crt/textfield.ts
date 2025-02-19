import { BorderBox } from "./box.js";
import { Font } from "./font.js";
import { Label } from "./label.js";
import { make } from "./screen.js";

export class TextField extends BorderBox {

  onEnter?(): void;
  onChange?(): void;

  #text = '';
  length = 10;
  font = Font.crt2025;

  #field = make(this.screen, Label, { text: '', padding: 0, border: 0x00000000 });
  #cursor = make(this.screen, Label, { text: '_', padding: 0, border: 0x00000000, color: 0x1177ffff });

  get color() { return this.#field.color; }
  set color(c: number) { this.#field.color = c; }

  get cursorColor() { return this.#cursor.color; }
  set cursorColor(c: number) { this.#cursor.color = c; }

  override children = [this.#field, this.#cursor];

  get text() { return this.#text; }
  set text(s: string) {
    this.#text = s;
    this.showText();
  }

  showText() {
    if (this.focused) {
      this.#field.text = this.text.slice(-this.length + 1);
    }
    else {
      this.#field.text = this.text.slice(0, this.length);
    }
    this.screen.layoutTree(this);
  }

  override layout(): void {
    this.#field.x = this.padding;
    this.#field.y = this.padding;
    this.#cursor.x = this.padding + (this.#cursor.w + 1) * this.#field.text.length;
    this.#cursor.y = this.padding;
  }

  override adjust(): void {
    const s = this.font.calcSize(' '.repeat(this.length));
    this.w = s.w + this.padding * 2;
    this.h = s.h + this.padding * 2;
  }

  override onKeyDown(key: string): void {
    if (key === 'v' && this.screen.keys['Control']) {
      navigator.clipboard.readText().then(s => {
        this.text += s;
        this.onChange?.();
      });
    }
    else if (key === 'c' && this.screen.keys['Control']) {
      navigator.clipboard.writeText(this.text);
    }
    else if (key === 'Enter') {
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
    this.showText();
  }

  override onBlur(): void {
    this.#stopBlinking();
    this.showText();
  }

}
