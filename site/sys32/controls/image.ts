import { Bitmap } from "../core/bitmap.js";
import { View } from "../core/view.js";

export class ImageView extends View {

  image?: Bitmap;
  padding = 0;
  override passthrough = true;

  override adjust(): void {
    this.w = (this.image?.w ?? 0) + this.padding * 2;
    this.h = (this.image?.h ?? 0) + this.padding * 2;
  }

  override draw(): void {
    super.draw?.();
    this.image?.draw(this.sys, this.padding, this.padding);
  }

}
