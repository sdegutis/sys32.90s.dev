export class CRT {

  pixels!: Uint8ClampedArray;
  clip = { cx: 0, cy: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
  raw = false;

  #canvas!: HTMLCanvasElement;
  #context!: CanvasRenderingContext2D;
  #imgdata!: ImageData;

  #autoscaling = false;

  width = 0;
  height = 0;

  init(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d')!;

    canvas.style.imageRendering = 'pixelated';
    canvas.style.backgroundColor = '#000';
    canvas.style.outline = 'none';
    canvas.style.cursor = 'none';

    this.resize(canvas.width, canvas.height);
  }

  resize(w: number, h: number) {
    this.#canvas.width = this.width = w;
    this.#canvas.height = this.height = h;

    this.pixels = new Uint8ClampedArray(w * h * 4);
    this.#imgdata = new ImageData(this.pixels, w, h);
    for (let i = 0; i < w * h * 4; i += 4) {
      this.pixels[i + 3] = 255;
    }

    this.clip.x2 = w - 1;
    this.clip.y2 = h - 1;

    if (this.#autoscaling) {
      this.#autoscale();
    }
  }

  #autoscale() {
    const rect = this.#canvas.parentElement!.getBoundingClientRect();
    let w = this.#canvas.width;
    let h = this.#canvas.height;
    let s = 1;
    while (
      (w += this.#canvas.width) <= rect.width &&
      (h += this.#canvas.height) <= rect.height
    ) s++;
    this.scale(s);
  }

  autoscale() {
    if (this.#autoscaling) return;
    this.#autoscaling = true;

    const observer = new ResizeObserver(() => this.#autoscale());
    observer.observe(this.#canvas.parentElement!);
    const done = () => {
      this.#autoscaling = false;
      observer.disconnect();
    };
    return done;
  }

  scale(scale: number) {
    this.#canvas.style.transform = `scale(${scale})`;
  }

  blit() {
    this.#context.putImageData(this.#imgdata, 0, 0);
  }

  pset(x: number, y: number, c: number) {
    this.rectFill(x, y, 1, 1, c);
  }

  rectLine(x: number, y: number, w: number, h: number, c: number) {
    this.rectFill(x + 1, y, w - 2, 1, c);
    this.rectFill(x + 1, y + h - 1, w - 2, 1, c);
    this.rectFill(x, y, 1, h, c);
    this.rectFill(x + w - 1, y, 1, h, c);
  }

  rectFill(x: number, y: number, w: number, h: number, c: number) {
    const cw = this.width;

    let x1 = this.raw ? x : x + this.clip.cx;
    let y1 = this.raw ? y : y + this.clip.cy;
    let x2 = x1 + w - 1;
    let y2 = y1 + h - 1;

    if (!this.raw && this.clip.x1 > x1) x1 = this.clip.x1;
    if (!this.raw && this.clip.y1 > y1) y1 = this.clip.y1;
    if (!this.raw && this.clip.x2 < x2) x2 = this.clip.x2;
    if (!this.raw && this.clip.y2 < y2) y2 = this.clip.y2;

    const r = c >> 24 & 0xff;
    const g = c >> 16 & 0xff;
    const b = c >> 8 & 0xff;
    const a = c & 0xff;

    // if (a === 0) return;

    for (y = y1; y <= y2; y++) {
      for (x = x1; x <= x2; x++) {
        const i = y * cw * 4 + x * 4;

        if (a === 255) {
          this.pixels[i + 0] = r;
          this.pixels[i + 1] = g;
          this.pixels[i + 2] = b;
        }
        else {
          const ia = (255 - a) / 255;
          const aa = (a / 255);
          this.pixels[i + 0] = (this.pixels[i + 0] * ia) + (r * aa);
          this.pixels[i + 1] = (this.pixels[i + 1] * ia) + (g * aa);
          this.pixels[i + 2] = (this.pixels[i + 2] * ia) + (b * aa);
        }
      }
    }
  }

}

export const crt = new CRT();
