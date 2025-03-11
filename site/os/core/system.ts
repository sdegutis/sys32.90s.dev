import { $ } from "../util/dyn.js"
import { Listener } from "../util/events.js"
import { vacuumFirstLayout } from "../util/layouts.js"
import { crt } from "./crt.js"
import { View } from "./view.js"

class Root extends View {
  override background = 0x00000000
  override layout = vacuumFirstLayout
  override onChildResized(): void {
    this.onParentDidLayout()
  }
  override onChildrenChanged(): void {
    this.onParentDidLayout()
  }
}

class System {

  readonly root = $(Root)

  focused: View = this.root
  keys: Record<string, boolean> = {}
  mouse = { x: 0, y: 0 }

  onTick = new Listener<number>()

  needsRedraw = true

  private allHovered = new Set<View>()
  private hovered: View = this.root

  private mouseMoved = new Listener()
  private mouseUp = new Listener()

  constructor() {
    this.root.onParentDidLayout = () => {
      this.root.layoutTree()
      this.checkUnderMouse()
      this.needsRedraw = true
    }

    this.root.w = crt.canvas.width
    this.root.h = crt.canvas.height
    this.addListeners()
    this.startTicks()
  }

  private addListeners() {
    crt.canvas.onkeydown = (e) => {
      if (e.key.length > 1 && e.key[0] === 'F') return

      e.preventDefault()
      this.keys[e.key] = true

      let node: View | undefined = this.focused
      while (node) {
        if (node.onKeyDown && node.onKeyDown(e.key)) {
          break
        }
        node = node.parent
      }

      this.needsRedraw = true
    }

    crt.canvas.onkeyup = (e) => {
      e.preventDefault()
      this.keys[e.key] = false
      this.needsRedraw = true
    }

    crt.canvas.oncontextmenu = (e) => {
      e.preventDefault()
    }

    crt.canvas.onmousedown = (e) => {
      e.preventDefault()
      crt.canvas.focus()
      this.focus(this.hovered)
      this.hovered.onMouseDown?.(e.button)
      this.needsRedraw = true
    }

    crt.canvas.onmousemove = (e) => {
      e.preventDefault()
      const x = Math.floor(e.offsetX)
      const y = Math.floor(e.offsetY)

      if (x === this.mouse.x && y === this.mouse.y) return
      if (x >= crt.canvas.width || y >= crt.canvas.height) return

      this.mouse.x = x
      this.mouse.y = y

      this.checkUnderMouse()

      this.mouseMoved.dispatch()

      this.needsRedraw = true
    }

    crt.canvas.onmouseup = (e) => {
      e.preventDefault()
      this.mouseUp.dispatch()
      this.needsRedraw = true
    }

    crt.canvas.onwheel = (e) => {
      e.preventDefault()

      let node: View | undefined = this.hovered
      while (node) {
        if (node.onScroll) {
          node.onScroll(e.deltaY < 0)
          this.needsRedraw = true
          return
        }
        node = node.parent
      }
    }

  }

  private startTicks() {
    let last = +document.timeline.currentTime!
    const update = (t: number) => {
      const delta = t - last
      if (delta >= 30) {
        this.onTick.dispatch(delta)

        if (this.needsRedraw) {
          this.needsRedraw = false

          this.draw(this.root)
          this.hovered.cursor?.draw(this.mouse.x, this.mouse.y)

          crt.blit()
        }
        last = t
      }
      requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }

  trackMouse(opts: { autostop?: boolean, move: () => void; up?: () => void }) {
    const autostop = opts.autostop ?? true
    opts.move()
    const destroyMove = this.mouseMoved.watch(opts.move)
    const destroyUp = this.mouseUp.watch(() => {
      opts.up?.()
      if (autostop) destroyBoth()
    })
    const destroyBoth = () => {
      destroyMove()
      destroyUp()
    }
    return destroyBoth
  }

  resize(w: number, h: number) {
    this.root.w = w
    this.root.h = h
    this.mouse.x = 0
    this.mouse.y = 0
    crt.resize(w, h)
    this.root.onParentDidLayout()
  }

  private checkUnderMouse() {
    const lastHovered = this.allHovered
    this.allHovered = new Set()

    const activeHovered = this.hover(this.root, this.mouse.x, this.mouse.y)!

    for (const view of this.allHovered.difference(lastHovered)) {
      view.onMouseEntered?.()
    }

    for (const view of lastHovered.difference(this.allHovered)) {
      view.onMouseExited?.()
    }

    if (this.hovered !== activeHovered) {
      this.hovered.hovered = false
      this.hovered = activeHovered
      this.hovered.hovered = true
    }
  }

  focusedPanel: View | undefined

  focus(view: View) {
    if (view === this.focused) return

    this.focused.focused = false
    this.focused.onBlur?.()

    this.focused = view
    this.focused.focused = true
    this.focused.onFocus?.()

    let newFocusedPanel
    let node: View | undefined = view
    while (node) {
      if (node.canBaseFocus) {
        newFocusedPanel = node
        break
      }
      node = node.parent
    }

    if (newFocusedPanel !== this.focusedPanel) {
      this.focusedPanel?.onBaseBlur?.()
      this.focusedPanel = newFocusedPanel
      this.focusedPanel?.onBaseFocus?.()
    }
  }

  private hover(node: View, x: number, y: number): View | null {
    if (!node.visible) return null

    let tx = 0
    let ty = 0
    let tw = node.w
    let th = node.h

    const inThis = (x >= tx && y >= ty && x < tw && y < th)
    if (!inThis) return null

    this.allHovered.add(node)

    node.mouse.x = x
    node.mouse.y = y

    let i = node.children.length
    while (i--) {
      const child = node.children[i]
      const found = this.hover(child, x - child.x, y - child.y)
      if (found) return found
    }

    if (node.passthrough) return null

    return node
  }

  private draw(node: View) {
    if (!node.visible) return

    const cx1 = crt.clip.x1
    const cx2 = crt.clip.x2
    const cy1 = crt.clip.y1
    const cy2 = crt.clip.y2

    crt.clip.cx += node.x
    crt.clip.cy += node.y
    crt.clip.x1 = Math.max(cx1, crt.clip.cx)
    crt.clip.y1 = Math.max(cy1, crt.clip.cy)
    crt.clip.x2 = Math.min(cx2, (crt.clip.cx + node.w - 1))
    crt.clip.y2 = Math.min(cy2, (crt.clip.cy + node.h - 1))

    node.draw?.()

    for (let i = 0; i < node.children.length; i++) {
      this.draw(node.children[i])
    }

    crt.clip.cx -= node.x
    crt.clip.cy -= node.y

    crt.clip.x1 = cx1
    crt.clip.x2 = cx2
    crt.clip.y1 = cy1
    crt.clip.y2 = cy2
  }

}

export const sys = new System()
