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

}
