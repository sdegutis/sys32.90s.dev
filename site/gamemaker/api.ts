import { crt } from "../os/core/crt.js"

export function drawrectf(x: number, y: number, w: number, h: number, c: number) {
  crt.rectFill(x, y, w, h, c)
}

export function drawrect(x: number, y: number, w: number, h: number, c: number) {
  crt.rectLine(x, y, w, h, c)
}
