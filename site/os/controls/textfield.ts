import { Font } from "../core/font.js";
import { mem, sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { Label } from "./label.js";

export class TextField extends View {

  onEnter?(): void;
  onChange?(): void;

  #field = $(Label, { text: '' });
  #cursor = $(Label, { visible: false, text: '_' });

  text = '';
  length = 10;
  font = mem.font;
  color = this.#field.color;
  cursorColor = 0x1177ffff;

  #showText() {
    if (this.focused) {
      this.#field.text = this.text.slice(-this.length + 1);
    }
    else {
      this.#field.text = this.text.slice(0, this.length);
    }
    this.layoutTree();
  }

  override init(): void {
    this.#field.$data.color = this.$data.color;
    this.#cursor.$data.color = this.$data.cursorColor;
    this.$data.font = mem.$data.font;
    this.#field.$data.font = this.$data.font;
    this.#cursor.$data.font = this.$data.font;
    this.children = [this.#field, this.#cursor];
    this.$data.text.watch(s => this.#showText());
  }

  override layout(): void {
    this.#field.x = 0;
    this.#field.y = 0;
    this.#cursor.x = (this.#cursor.w + 1) * this.#field.text.length;
    this.#cursor.y = 0;
  }

  override adjust(): void {
    const s = this.font.calcSize(' '.repeat(this.length));
    this.w = s.w;
    this.h = s.h;
  }

  override onKeyDown(key: string): boolean {
    if (key === 'v' && sys.keys['Control']) {
      navigator.clipboard.readText().then(s => {
        this.text += s;
        this.onChange?.();
      });
      this.#restartBlinking();
      return true;
    }
    else if (key === 'c' && sys.keys['Control']) {
      navigator.clipboard.writeText(this.text);
      this.#restartBlinking();
      return true;
    }
    else if (key === 'Enter') {
      this.onEnter?.();
      this.#restartBlinking();
      return true;
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1);
      this.onChange?.();
      this.#restartBlinking();
      return true;
    }
    else if (key.length === 1) {
      this.text += key;
      this.onChange?.();
      this.#restartBlinking();
      return true;
    }
    return false;
  };

  #blink?: ReturnType<typeof setInterval>;

  #restartBlinking() {
    this.#stopBlinking();
    this.#cursor.visible = true;
    this.#blink = setInterval(() => {
      this.#cursor.visible = !this.#cursor.visible;
      sys.needsRedraw = true;
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
