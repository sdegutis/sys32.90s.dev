import { Label } from "../controls/label.js";

export class Clock extends Label {

  private timer?: ReturnType<typeof setInterval>;

  override init(): void {
    super.init();
    this.updateTime();
  }

  override adopted(): void {
    this.timer = setInterval((() => {
      this.updateTime();
      this.parent?.layoutTree();
    }), 1000);
  }

  override abandoned(): void {
    clearInterval(this.timer);
    this.timer = undefined!;
  }

  private updateTime() {
    this.text = new Date().toLocaleTimeString('en-us');
  }

  // override draw(): void {
  //   super.draw();

  //   this.sys.crt.raw = true;
  //   this.sys.crt.rectFill(10, 2, 200, 100, 0x0000ff88)
  //   this.sys.crt.raw = false;
  // }

}
