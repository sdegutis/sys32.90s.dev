import { mem } from "../core/memory.js";
import { sys } from "../core/system.js";
import { $, View } from "../core/view.js";
import { makeVacuumLayout } from "../util/layouts.js";
import { Scroll } from "./scroll.js";

export class TextArea extends View {

  font = mem.font;
  color = 0xffffffff;
  private lines: string[] = [];

  // override passthrough = false;

  private scroll!: Scroll;
  private label!: View;
  private _cursor!: View;

  get text() { return this.lines.join('\n') }
  set text(s: string) {
    this.lines = s.split('\n');
    this.row = Math.min(this.row, this.lines.length - 1);
    this.fixCol();
    this.layoutTree();
  }

  cursorColor = 0x99000099;

  row = 0;
  col = 0;
  end = 0;

  override layout = makeVacuumLayout();

  override init(): void {
    // passthrough: false,
    //   onFocus(this: Partial<View>) { this.firstChild?.focus() },

    this.children = [
      this.scroll = $(Scroll, {},
        this.label = $(View, {
          adjust: () => { this.adjustTextLabel() },
          draw: () => { this.drawTextLabel() },
          // onmou: () => { this.drawTextLabel() },
        },
          this._cursor = $(View, { visible: false, w: this.font.width, h: this.font.height })
        )
      )
    ];

    this.$data.cursorColor.watch(c => this._cursor.background = c);
  }

  private drawTextLabel() {
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

  private adjustTextLabel() {
    let w = 0;
    for (const line of this.lines) {
      if (line.length > w) w = line.length;
    }
    this.label.w = w * this.font.width + (w - 1) * this.font.xgap;
    this.label.h = (this.lines.length * this.font.height) + ((this.lines.length - 1) * this.font.ygap);
    this.label.w += this.font.width + this.font.xgap;
  }

  private reflectCursorPos() {
    this._cursor.x = this.col * this.font.xgap + this.col * this.font.width;
    this._cursor.y = this.row * this.font.ygap + this.row * this.font.height;
  }

  private scrollCursorIntoView() {
    let x = this._cursor.x;
    let y = this._cursor.y;

    let node = this._cursor;
    while (node !== this.scroll) {
      node = node.parent!;
      x += node.x;
      y += node.y;
    }

    if (y < 0) {
      this.scroll.scrolly -= -y;
      this.layoutTree();
    }

    if (x < 0) {
      this.scroll.scrollx -= -x;
      this.layoutTree();
    }

    const maxy = this.scroll.h - this._cursor.h;
    if (y > maxy) {
      this.scroll.scrolly -= maxy - y;
      this.layoutTree();
    }

    const maxx = this.scroll.w - this._cursor.w;
    if (x > maxx) {
      this.scroll.scrollx -= maxx - x;
      this.layoutTree();
    }
  }

  override onKeyDown(key: string): boolean {
    if (key === 'Home') {
      if (sys.keys['Control']) {
        this.row = 0
        this.end = this.col = 0;
      }
      else {
        this.end = this.col = 0;
      }
    }
    else if (key === 'End') {
      if (sys.keys['Control']) {
        this.row = this.lines.length - 1;
        this.col = this.end = this.lines[this.row].length;
      }
      else {
        this.end = this.col = this.lines[this.row].length;
      }
    }
    else if (key === 'ArrowRight') {
      if (this.col < this.lines[this.row].length) {
        this.end = this.col = this.col + 1;
      }
      else if (this.row < this.lines.length - 1) {
        this.col = this.end = 0;
        this.row++;
      }
    }
    else if (key === 'ArrowLeft') {
      if (this.col > 0) {
        this.end = this.col = this.col - 1;
      }
      else if (this.row > 0) {
        this.row--;
        this.end = this.col = this.lines[this.row].length;
      }
    }
    else if (key === 'ArrowDown') {
      this.row = Math.min(this.row + 1, this.lines.length - 1);
      this.fixCol();
    }
    else if (key === 'ArrowUp') {
      this.row = Math.max(0, this.row - 1);
      this.fixCol();
    }
    else if (key === 'Tab') {
      const [a, b] = this.halves();
      this.lines[this.row] = a + '  ' + b;
      this.col += 2;
      this.end = this.col;
      this.layoutTree();
    }
    else if (key === 'Backspace') {
      if (this.col > 0) {
        const [a, b] = this.halves();
        if (a === ' '.repeat(a.length) && a.length >= 2) {
          this.lines[this.row] = a.slice(0, -2) + b;
          this.col -= 2;
          this.end = this.col;
          this.layoutTree();
        }
        else {
          this.lines[this.row] = a.slice(0, -1) + b;
          this.col--;
          this.end = this.col;
          this.layoutTree();
        }
      }
      else if (this.row > 0) {
        this.end = this.lines[this.row - 1].length;
        this.lines[this.row - 1] += this.lines[this.row];
        this.lines.splice(this.row, 1);
        this.row--;
        this.col = this.end;
        this.layoutTree();
      }
    }
    else if (key === 'Delete') {
      if (this.col < this.lines[this.row].length) {
        const [a, b] = this.halves();
        this.lines[this.row] = a + b.slice(1);
        this.layoutTree();
      }
      else if (this.row < this.lines.length - 1) {
        this.lines[this.row] += this.lines[this.row + 1];
        this.lines.splice(this.row + 1, 1);
        this.layoutTree();
      }
    }
    else if (key === 'Enter') {
      const [a, b] = this.halves();
      this.lines[this.row] = a;
      this.lines.splice(++this.row, 0, b);
      this.end = this.col = 0;
      this.layoutTree();
    }
    else if (key.length === 1 && !sys.keys['Control']) {
      const [a, b] = this.halves();
      this.lines[this.row] = a + key + b;
      this.col++;
      this.end = this.col;
      this.layoutTree();
    }
    else {
      return false;
    }

    this.restartBlinking();
    this.reflectCursorPos();
    this.scrollCursorIntoView();
    return true;
  }

  private halves() {
    let line = this.lines[this.row];
    const first = line.slice(0, this.col);
    const last = line.slice(this.col);
    return [first, last] as const;
  }

  private fixCol() {
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
