import { Bitmap } from "./bitmap.js";
import { Box } from "./box.js";

export class ImageBox extends Box {

  public image?: Bitmap;

  override adjust(): void {
    this.w = this.image?.w ?? 0;
    this.h = this.image?.h ?? 0;
  }

  override draw(): void {
    this.image?.draw(this.sys, 0, 0);
  }

}
