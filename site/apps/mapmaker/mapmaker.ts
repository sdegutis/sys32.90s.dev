import { PanedXA, PanedYA } from "../../os/containers/paned.js";
import { Button } from "../../os/controls/button.js";
import { Label } from "../../os/controls/label.js";
import { crt } from "../../os/core/crt.js";
import { sys } from "../../os/core/system.js";
import { $, View } from "../../os/core/view.js";
import { Panel } from "../../os/core/panel.js";
import { makeStripeDrawer } from "../../os/util/draw.js";
import { multiplex, Reactive } from "../../os/util/events.js";
import { makeFlowLayoutY, makeVacuumLayout } from "../../os/util/layouts.js";
import { dragMove, TileSelection } from "../../os/util/selections.js";

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];

export default () => {

  const map = new Map(50, 40);

  const panel = $(Panel, { title: 'mapmaker', },
    $(View, { layout: makeVacuumLayout(), background: 0xffffff11 },

      $(PanedXA, {
        onScroll: (up) => {
          if (up) {
            map.currentTool.data--;
            if (map.currentTool.data < 0) map.currentTool.update(15);
          }
          else {
            map.currentTool.data++;
            if (map.currentTool.data === 16) map.currentTool.update(0);
          }
        }
      },
        $(PanedYA, { w: 19, background: 0x333333ff },
          $(Button, {
            background: 0x00000033, padding: 2, onClick: () => {
              const mapView = panel.find<MapView>('mapview')!;
              return mapView.showGrid = !mapView.showGrid;
            }
          },
            $(Label, { text: 'grid' })
          ),
          $(View, { layout: makeFlowLayoutY() },
            ...COLORS.map((col, i) => {

              const button = $(Button, { padding: 1, onClick: () => { map.currentTool.update(i); } },
                $(View, { passthrough: true, w: 4, h: 4, background: col })
              );

              multiplex({
                currentTool: map.currentTool,
                hovered: button.$data.hovered,
                pressed: button.$data.pressed,
              }).watch(data => {
                let color = 0;
                if (data.currentTool === i) color = 0xffffff77;
                else if (data.pressed) color = 0xffffff11;
                else if (data.hovered) color = 0xffffff33;
                button.borderColor = color;
              });

              return button;
            })
          )
        ),
        $(View, { background: 0x333344ff, layout: makeVacuumLayout() },
          $(View, {
            background: 0x222222ff,
            draw: makeStripeDrawer(4, 2)
          },
            $(MapView, { id: 'mapview', map })
          )
        )
      )

    )
  );

  panel.show();

}

class Map {

  currentTool = new Reactive(5);

  width: number;
  height: number;

  terrain: number[] = [];
  units: number[] = [];

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.terrain = Array(this.width * this.height).fill(3);
    this.units = Array(this.width * this.height).fill(0);


  }

  useTool(tx: number, ty: number) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return;
    const ti = ty * this.width + tx;
    this.terrain[ti] = this.currentTool.data;
  }

}





class MapView extends View {

  showGrid = true;
  map!: Map;

  private drawTerrain: ((x: number, y: number) => void)[] = [];
  private tilesel: TileSelection | null = null;

  override cursor = null;

  override init(): void {
    for (let i = 0; i < 16; i++) {
      this.drawTerrain.push((x, y) => {
        crt.rectFill(x, y, 4, 4, COLORS[i]);
      });
    }

    this.drawTerrain.push((x, y) => {
      crt.rectFill(x, y, 4, 4, COLORS[3]);
    });

    this.w = this.map.width * 4;
    this.h = this.map.height * 4;
  }

  override onMouseDown(): void {
    if (sys.keys[' ']) {
      sys.trackMouse({ move: dragMove(this) });
    }
    else if (sys.keys['Control']) {
      this.tilesel = new TileSelection(this, 4);

      sys.trackMouse({
        move: () => {
          this.tilesel!.update();

          const tx1 = Math.max(this.tilesel!.tx1, 0);
          const ty1 = Math.max(this.tilesel!.ty1, 0);
          const tx2 = Math.min(this.tilesel!.tx2, this.map.width);
          const ty2 = Math.min(this.tilesel!.ty2, this.map.height);

          for (let y = ty1; y < ty2; y++) {
            for (let x = tx1; x < tx2; x++) {
              this.map.useTool(x, y);
            }
          }

        },
        up: () => {
          this.tilesel = null;
        },
      });
    }
    else if (sys.keys['Alt']) {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / 4);
          const y = Math.floor(this.mouse.y / 4);
          this.map.useTool(x + 0, y + 0);
          this.map.useTool(x + 1, y + 0);
          this.map.useTool(x - 1, y + 0);
          this.map.useTool(x + 0, y + 1);
          this.map.useTool(x + 0, y - 1);
        },
      });
    }
    else {
      sys.trackMouse({
        move: () => {
          const x = Math.floor(this.mouse.x / 4);
          const y = Math.floor(this.mouse.y / 4);
          this.map.useTool(x, y);
        },
      });
    }

  }

  override draw(): void {
    // for (let i = 0; i < 300; i++)
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const i = y * this.map.width + x;
        const t = this.map.terrain[i];
        this.drawTerrain[t](x * 4, y * 4);
      }
    }

    if (this.showGrid) {
      for (let x = 0; x < this.map.width; x++) {
        crt.rectFill(x * 4, 0, 1, this.map.height * 4, 0x00000011);
      }

      for (let y = 0; y < this.map.height; y++) {
        crt.rectFill(0, y * 4, this.map.width * 4, 1, 0x00000011);
      }
    }

    if (this.hovered) {
      const tx = Math.floor(this.mouse.x / 4);
      const ty = Math.floor(this.mouse.y / 4);
      crt.rectFill(tx * 4, ty * 4, 4, 4, 0x0000ff77);

      if (sys.keys['Alt']) {
        crt.rectFill((tx + 0) * 4, (ty + 1) * 4, 4, 4, 0x0000ff77);
        crt.rectFill((tx + 0) * 4, (ty - 1) * 4, 4, 4, 0x0000ff77);
        crt.rectFill((tx + 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
        crt.rectFill((tx - 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
      }
    }

    if (this.tilesel) {
      const { tx1, tx2, ty1, ty2 } = this.tilesel;

      crt.rectLine(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
      crt.rectFill(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
    }

    // crt.rectFill(this.mouse.x, this.mouse.y - 2, 1, 5, 0x00000077);
    // crt.rectFill(this.mouse.x - 2, this.mouse.y, 5, 1, 0x00000077);
    // crt.pset(this.mouse.x, this.mouse.y, 0xffffffff);

  }

}
