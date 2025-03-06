import { Label } from "../controls/label.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";

export class TextArea extends Label {

  private _cursor = $(View, { visible: false, w: this.font.width, h: this.font.height });

  row = 0;
  col = 0;
  icol = 0;

  // colors: number[] = [];

  override passthrough = false;

  cursorColor = 0x99000099;

  override init(): void {
    super.init();
    this.children = [this._cursor];

    this.$data.cursorColor.watch(c => this._cursor.background = c);

    this.$data.row.watch(() => this.fixCursorPos());
    this.$data.icol.watch(() => this.fixCursorPos());

    this.$data.col.watch(() => this.reflectCursorPos());
    this.$data.row.watch(() => this.reflectCursorPos());

    this.$data.text.watch(() => {
      console.log(this.lines)
      this.fixCursorPos();
    });
  }

  private reflectCursorPos() {
    this._cursor.x = this.col * this.font.xgap + this.col * this.font.width;
    this._cursor.y = this.row * this.font.ygap + this.row * this.font.height;
  }

  override adjust(): void {
    super.adjust();

    this.w += this.font.width + this.font.xgap;
  }

  override draw(): void {
    super.draw();

    let c = this.color;

    const x = 0;
    const y = 0;

    const text = this.text;
    const font = this.font;

    let posx = 0;
    let posy = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      // if (this.colors[i]) c = this.colors[i];

      if (ch === '\n') {
        posy++;
        posx = 0;
        continue;
      }

      const px = x + (posx * 4);
      const py = y + (posy * 6);

      const map = font.chars[ch];
      map.draw(px, py, c);

      posx++;

    }

  }

  override onKeyDown(key: string): boolean {
    if (sys.keys['Control']) return false;

    if (key === 'Home') {
      this.restartBlinking();
      this.icol = 0;
    }

    if (key === 'End') {
      this.restartBlinking();
      this.icol = Infinity;
    }

    if (key === 'ArrowRight') {
      this.restartBlinking();
      console.log(!isFinite(this.icol))
      this.icol++;
    }

    if (key === 'ArrowLeft') {
      this.restartBlinking();
      this.icol--;
      if (this.icol < 0) this.icol = 0;
    }

    if (key === 'ArrowDown') {
      this.restartBlinking();
      this.row = Math.min(this.row + 1, this.lines.length - 1);
    }

    if (key === 'ArrowUp') {
      this.restartBlinking();
      this.row = Math.max(0, this.row - 1);
    }

    return true;
  }

  private fixCursorPos() {
    const max = this.lines[this.row].length;
    let col = this.icol;
    if (col > max) col = max;
    this.col = col;
  }

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
  }

  override onBlur(): void {
    this.stopBlinking();
  }

}
