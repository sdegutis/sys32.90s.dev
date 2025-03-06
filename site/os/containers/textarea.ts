import { Label } from "../controls/label.js";
import { crt } from "../core/crt.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";

export class TextArea extends Label {

  private _cursor = $(View, { visible: false, w: this.font.width, h: this.font.height });

  row = 0;
  col = 0;
  end = 0;

  // colors: number[] = [];

  override passthrough = false;

  cursorColor = 0x99000099;

  override init(): void {
    super.init();
    this.children = [this._cursor];

    this.$data.cursorColor.watch(c => this._cursor.background = c);

    this.$data.col.watch(() => this.reflectCursorPos());
    this.$data.row.watch(() => this.reflectCursorPos());

    this.$data.text.watch(() => {
      console.log(this.lines)
      this.constrainCursorCol();
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
    crt.rectFill(0, 0, this.w, this.h, this.background)

    for (let y = 0; y < this.lines.length; y++) {
      const line = this.lines[y];
      const py = y * this.font.height + y * this.font.ygap;
      for (let x = 0; x < line.length; x++) {
        const char = this.font.chars[line[x]];
        const px = x * this.font.width + x * this.font.xgap;
        char.draw(px, py, this.color);
      }
    }
  }

  override onKeyDown(key: string): boolean {
    if (sys.keys['Control']) return false;

    if (key === 'Home') {
      this.restartBlinking();
      this.end = this.col = 0;
    }
    else if (key === 'End') {
      this.restartBlinking();
      this.end = this.col = this.lines[this.row].length;
    }
    else if (key === 'ArrowRight') {
      this.restartBlinking();
      this.end = this.col = Math.min(this.col + 1, this.lines[this.row].length);
    }
    else if (key === 'ArrowLeft') {
      this.restartBlinking();
      this.end = this.col = Math.max(0, this.col - 1);
    }
    else if (key === 'ArrowDown') {
      this.restartBlinking();
      this.row = Math.min(this.row + 1, this.lines.length - 1);
      this.constrainCursorCol();
    }
    else if (key === 'ArrowUp') {
      this.restartBlinking();
      this.row = Math.max(0, this.row - 1);
      this.constrainCursorCol();
    }
    else if (key === 'Backspace') {
      if (this.col > 0) {
        const [a, b] = this.linehalves();
        this.lines[this.row] = a.slice(0, -1) + b;
        this.col--;
        this.end = this.col;

        this.parent?.layoutTree();
        sys.needsRedraw = true;
      }
    }
    else if (key === 'Delete') {
      if (this.col < this.lines[this.row].length) {
        const [a, b] = this.linehalves();
        this.lines[this.row] = a + b.slice(1);

        this.parent?.layoutTree();
        sys.needsRedraw = true;
      }
    }
    else if (key.length === 1) {
      const [a, b] = this.linehalves();
      this.lines[this.row] = a + key + b;
      this.col++;
      this.end = this.col;

      this.parent?.layoutTree();
      sys.needsRedraw = true;
    }

    return true;
  }

  private linehalves() {
    let line = this.lines[this.row];
    const first = line.slice(0, this.col);
    const last = line.slice(this.col);
    return [first, last] as const;
  }

  private constrainCursorCol() {
    this.col = Math.min(this.lines[this.row].length, this.end);
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
