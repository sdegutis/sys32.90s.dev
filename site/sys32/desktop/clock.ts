import { Group } from "../containers/group.js";
import { Label } from "../controls/label.js";

export class Clock extends Group {

  #label = this.sys.make(Label);
  #timer?: ReturnType<typeof setInterval>;

  override init(): void {
    this.children = [this.#label];
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
    this.#label.text = new Date().toLocaleTimeString('en-us');
  }

}
