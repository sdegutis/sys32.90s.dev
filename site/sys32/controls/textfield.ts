import { Font } from "../core/font.js";
import { View } from "../core/view.js";
import { Label } from "./label.js";

export class TextField extends View {

  padding = 0;

  onEnter?(): void;
  onChange?(): void;

  #text = '';
  length = 10;
  font = Font.crt2025;

  #field = this.sys.make(Label, { text: '', padding: 0 });
  #cursor = this.sys.make(Label, { visible: false, text: '_', padding: 0, color: 0x1177ffff });

  get color() { return this.#field.color; }
  set color(c: number) { this.#field.color = c; }

  get cursorColor() { return this.#cursor.color; }
  set cursorColor(c: number) { this.#cursor.color = c; }

  get text() { return this.#text; }
  set text(s: string) {
    this.#text = s;
    this.#showText();
  }

  #showText() {
    if (this.focused) {
      this.#field.text = this.text.slice(-this.length + 1);
    }
    else {
      this.#field.text = this.text.slice(0, this.length);
    }
    this.sys.layoutTree(this);
  }

  override init(): void {
    this.children = [this.#field, this.#cursor];
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
    if (key === 'v' && this.sys.keys['Control']) {
      navigator.clipboard.readText().then(s => {
        this.text += s;
        this.onChange?.();
      });
    }
    else if (key === 'c' && this.sys.keys['Control']) {
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
      this.sys.needsRedraw = true;
    }, 500);
  }

  #stopBlinking() {
    this.#cursor.visible = false;
    clearInterval(this.#blink);
  }

  override onFocus(): void {
    this.#restartBlinking();
    this.#showText();
  }

  override onBlur(): void {
    this.#stopBlinking();
    this.#showText();
  }

}
