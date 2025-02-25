import { Bitmap } from "../core/bitmap.js";
import { View } from "../core/view.js";

export class ImageView extends View {

  image?: Bitmap;
  override passthrough = true;

  override adjust(): void {
    this.w = (this.image?.w ?? 0);
    this.h = (this.image?.h ?? 0);
  }

  override draw(): void {
    super.draw?.();
    this.image?.draw(this.sys.crt, 0, 0);
  }

}
