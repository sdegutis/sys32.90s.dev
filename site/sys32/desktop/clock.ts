import { Label } from "../controls/label.js";

export class Clock extends Label {

  #timer?: ReturnType<typeof setInterval>;

  override init(): void {
    this.#updateTime();
  }

  override adopted(): void {
    this.#timer = setInterval((() => {
      this.#updateTime();
      this.sys.layoutTree();
    }), 1000);
  }

  override abandoned(): void {
    clearInterval(this.#timer);
    this.#timer = undefined!;
  }

  #updateTime() {
    this.text = new Date().toLocaleTimeString('en-us');
  }

  // override draw(): void {
  //   super.draw();

  //   const old = { ...      this.sys.crt.clip };
  //   this.sys.crt.clip.cx = 0;
  //   this.sys.crt.clip.cy = 0;
  //   this.sys.crt.clip.x1 = 0;
  //   this.sys.crt.clip.y1 = 0;
  //   this.sys.crt.clip.x2 = 320;
  //   this.sys.crt.clip.y2 = 180;

  //   this.sys.crt.rectFill(10, 2, 200, 100, 0x0000ff88)

  //   Object.assign(this.sys.crt.clip, old);
  // }

}
