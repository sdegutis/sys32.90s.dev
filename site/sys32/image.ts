import { Bitmap } from "./bitmap.js";
import { Box } from "./box.js";

export class ImageBox extends Box {

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
