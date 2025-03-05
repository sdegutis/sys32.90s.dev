import { mem } from "../core/memory.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { Label } from "./label.js";

export class TextField extends View {

  onEnter?(): void;
  onChange?(): void;

  private _field = $(Label, { text: '' });
  private _cursor = $(Label, { visible: false, text: '_' });

  text = '';
  length = 10;
  font = mem.font;
  color = this._field.color;
  cursorColor = 0x1177ffff;

  private showText() {
    if (this.focused) {
      this._field.text = this.text.slice(-this.length + 1);
    }
    else {
      this._field.text = this.text.slice(0, this.length);
    }
    this.layoutTree();
  }

  override init(): void {
    this._field.$data.color = this.$data.color;
    this._cursor.$data.color = this.$data.cursorColor;
    this.font = mem.font;
    this._field.$data.font = this.$data.font;
    this._cursor.$data.font = this.$data.font;
    this.children = [this._field, this._cursor];
    this.$data.text.watch(s => this.showText());
  }

  override layout(): void {
    this._field.x = 0;
    this._field.y = 0;
    this._cursor.x = (this._cursor.w + 1) * this._field.text.length;
    this._cursor.y = 0;
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
      this.restartBlinking();
      return true;
    }
    else if (key === 'c' && sys.keys['Control']) {
      navigator.clipboard.writeText(this.text);
      this.restartBlinking();
      return true;
    }
    else if (key === 'Enter') {
      this.onEnter?.();
      this.restartBlinking();
      return true;
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1);
      this.onChange?.();
      this.restartBlinking();
      return true;
    }
    else if (key.length === 1) {
      this.text += key;
      this.onChange?.();
      this.restartBlinking();
      return true;
    }
    return false;
  };

  private blink?: ReturnType<typeof setInterval>;

  private restartBlinking() {
    this.stopBlinking();
    this._cursor.visible = true;
    this.blink = setInterval(() => {
      this._cursor.visible = !this._cursor.visible;
      sys.needsRedraw = true;
    }, 500);
  }

  private stopBlinking() {
    this._cursor.visible = false;
    clearInterval(this.blink);
  }

  override onFocus(): void {
    this.restartBlinking();
    this.showText();
  }

  override onBlur(): void {
    this.stopBlinking();
    this.showText();
  }

}
