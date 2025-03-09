import { Border } from "../containers/border.js"
import { Group, GroupX } from "../containers/group.js"
import { PanedYA } from "../containers/paned.js"
import { Spaced } from "../containers/spaced.js"
import { Button, ClickCounter } from "../controls/button.js"
import { ImageView } from "../controls/image.js"
import { Label } from "../controls/label.js"
import { Bitmap } from "../core/bitmap.js"
import { Cursor } from "../core/cursor.js"
import { sys } from "../core/system.js"
import { View } from "../core/view.js"
import { fs } from "../fs/fs.js"
import { $ } from "../util/dyn.js"
import { Listener } from "../util/events.js"
import { vacuumFirstLayout } from "../util/layouts.js"
import { dragMove, dragResize } from "../util/selections.js"
import { ws } from "./workspace.js"

const minImage = new Bitmap([0x333333ff], 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,])
const maxImage = new Bitmap([0x333333ff], 4, [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1,])
const axeImage = new Bitmap([0x333333ff], 4, [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,])
const adjImage = new Bitmap([0xffffff77], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,])

const menubuttonImage = Bitmap.fromString(fs.get('sys/menubutton.bitmap')!)

const adjCursor = Cursor.fromBitmap(new Bitmap([0x000000cc, 0xffffffff, 0xfffffffe], 5, [
  0, 1, 1, 1, 0,
  1, 1, 2, 1, 1,
  1, 2, 3, 2, 1,
  1, 1, 2, 1, 1,
  0, 1, 1, 1, 0,
]))

export class Panel extends View {

  didClose = new Listener()

  onMenu?(): void

  override background = 0x070707ee
  override layout = vacuumFirstLayout

  title = ''

  override w = 240
  override h = 140

  minw = 30
  minh = 30

  private lastPos?: { x: number, y: number, w: number, h: number }

  override init(): void {
    const pad = 2

    const content = this.children[0]



    const counter = new ClickCounter()
    const titleBarMouseDown = () => {
      counter.increase()
      const drag = dragMove(this)
      sys.trackMouse({
        move: () => {
          const moved = drag()
          if (Math.hypot(moved.x, moved.y) > 1) {
            counter.count = 0
            this.lastPos = undefined!
          }
        },
        up: () => {
          if (counter.count >= 2) {
            this.maximize()
          }
        },
      })
    }

    this.children = [

      $(Border, { padding: 1, layout: vacuumFirstLayout, $borderColor: this.$data('panelFocused').adapt<number>(b => b ? 0x005599ff : 0x00559944) },

        $(PanedYA, {},

          $(Spaced, { onMouseDown: titleBarMouseDown, },
            $(Border, {},
              $(GroupX, { gap: 1 },
                $(Button, { background: 0x111111ff, padding: 2, onClick: () => this.onMenu?.() }, $(ImageView, { image: menubuttonImage })),
                $(Label, { $text: this.$data('title'), color: 0xaaaaaaff })
              )
            ),
            $(Group, { gap: 0 },
              $(Button, { background: 0x111111ff, padding: 2, onClick: () => this.minimize() }, $(ImageView, { image: minImage })),
              $(Button, { background: 0x111111ff, padding: 2, onClick: () => this.maximize() }, $(ImageView, { image: maxImage })),
              $(Button, { background: 0x111111ff, padding: 2, onClick: () => this.close(), hoverBackground: 0x99000055, pressBackground: 0x44000099 }, $(ImageView, { image: axeImage }))
            )
          ),

          $(Group, {
            layout() {
              const c = this.firstChild!
              c.x = pad
              c.y = 0
              c.w = this.w - (pad * 2)
              c.h = this.h - pad
            }
          }, content),

        ),

        $(ImageView, {
          passthrough: false,
          image: adjImage,
          cursor: adjCursor,
          layout() {
            this.x = this.parent!.w - this.w
            this.y = this.parent!.h - this.h
          },
          onMouseDown: () => {
            this.lastPos = undefined!
            const resize = dragResize(this)
            sys.trackMouse({
              move: () => {
                resize()
                if (this.w < this.minw) this.w = this.minw
                if (this.h < this.minh) this.h = this.minh
                sys.layoutTree(this)
              }
            })
          },
        }),


      )

    ]
  }

  close() {
    this.parent!.removeChild(this)
    this.didClose.dispatch()
  }

  minimize() {
    this.visible = false
  }

  maximize() {
    if (this.lastPos) {
      this.x = this.lastPos.x
      this.y = this.lastPos.y
      this.w = this.lastPos.w
      this.h = this.lastPos.h
      this.lastPos = undefined!
      sys.layoutTree(this)
    }
    else {
      this.lastPos = { x: this.x, y: this.y, w: this.w, h: this.h }

      // const a = { ...this.lastPos }
      // const b = { x: 0, y: 0, w: this.parent!.w, h: this.parent!.h }

      // let total = 100
      // let sofar = 0

      // const done = sys.onTick.watch(delta => {
      //   sofar += delta
      //   if (sofar >= total) done()
      //   let p = Math.min(1, Math.max(0, sofar / total))
      //   p = -(Math.cos(Math.PI * p) - 1) / 2

      //   this.x = Math.round((b.x - a.x) * p + a.x)
      //   this.y = Math.round((b.y - a.y) * p + a.y)
      //   this.w = Math.round((b.w - a.w) * p + a.w)
      //   this.h = Math.round((b.h - a.h) * p + a.h)
      //   sys.layoutTree(this)
      // })

      this.x = 0
      this.y = 0
      this.w = this.parent!.w
      this.h = this.parent!.h
      sys.layoutTree(this)
    }

  }

  show() {
    ws.addPanel(this)
    this.visible = true
  }

  hide() {
    this.visible = false
  }

  override canBaseFocus = true

  override onBaseFocus(): void {
    this.parent?.addChild(this)
    this.panelFocused = true
  }

  override onBaseBlur(): void {
    this.panelFocused = false
  }

  panelFocused = false

}
