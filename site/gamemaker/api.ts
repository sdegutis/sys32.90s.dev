import { crt } from "../os/core/crt.js"
import { sys } from "../os/core/system.js"
import { data } from "./bridge.js"

export const keys = sys.keys

export function take() {
  return data
}

export function drawrectf(x: number, y: number, w: number, h: number, c: number) {
  crt.rectFill(x, y, w, h, c)
}

export function cls(c = 0x000000ff) {
  crt.rectFill(0, 0, 320, 180, c)
}

export function drawrect(x: number, y: number, w: number, h: number, c: number) {
  crt.rectLine(x, y, w, h, c)
}
