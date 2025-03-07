import { crt } from "../../os/core/crt.js";
import { crt34 } from "../../os/core/font.js";
import { sys } from "../../os/core/system.js";
import { View } from "../../os/core/view.js";

export class CharView extends View {

  char!: string;
  font = crt34;

  override cursor = null;

  width = 2;
  height = 2;
  zoom = 1;

  spots: Record<string, boolean> = {};

  override background = 0x000000ff;

  override init(): void {
    for (let y = 0; y < this.font.height; y++) {
      for (let x = 0; x < this.font.width; x++) {
        let k = `${x},${y}`;
        if (this.font.chars[this.char].pget(x, y) > 0) {
          this.spots[k] = true;
        }
      }
    }
  }

  override adjust(): void {
    this.w = this.width * this.zoom;
    this.h = this.height * this.zoom;
  }

  override draw(): void {
    super.draw();

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tx = x * this.zoom;
        const ty = y * this.zoom;
        const key = `${x},${y}`;

        if (this.spots[key]) {
          crt.rectFill(tx, ty, this.zoom, this.zoom, 0xffffffff);
        }
      }
    }

    if (this.hovered) {
      const tx = Math.floor(this.mouse.x / this.zoom) * this.zoom;
      const ty = Math.floor(this.mouse.y / this.zoom) * this.zoom;

      crt.rectFill(tx, ty, this.zoom, this.zoom, 0xff000099);
    }
  }

  override onMouseDown(button: number): void {
    sys.trackMouse({
      move: () => {
        const tx = Math.floor(this.mouse.x / this.zoom);
        const ty = Math.floor(this.mouse.y / this.zoom);

        const key = `${tx},${ty}`;
        this.spots[key] = button === 0;
        this.font.chars[this.char].pset(tx, ty, button === 0 ? 1 : 0);
      }
    });
  }

}
