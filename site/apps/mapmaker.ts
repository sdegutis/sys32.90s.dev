import { PanedXA, PanedYA } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { makeStripeDrawer } from "../sys32/util/draw.js";
import { multiplex, Reactive } from "../sys32/util/events.js";
import { makeFlowLayoutY, makeVacuumLayout } from "../sys32/util/layouts.js";
import { dragMove, TileSelection } from "../sys32/util/selections.js";

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];

export default (sys: System) => {

  const { $ } = sys;

  let root: PanedXA;
  let gridButton: Button;
  let mapArea: View;
  let mapView: MapView;

  const map = new Map(50, 40);

  const panel = $(Panel, { title: 'mapmaker', },
    $(View, { layout: makeVacuumLayout(), background: 0xffffff11 },

      root = $(PanedXA, {},
        $(PanedYA, { w: 19, background: 0x333333ff },
          gridButton = $(Button, {
            background: 0x00000033,
            all: 2,
            onClick: () => mapView.showGrid = !mapView.showGrid
          },
            $(Label, { text: 'grid' })
          ),
          $(View, { layout: makeFlowLayoutY() },
            ...COLORS.map((col, i) => {

              const border = $(Button, { all: 1, onClick: () => { map.currentTool.val = i; } },
                $(View, { passthrough: true, w: 4, h: 4, background: col })
              );

              multiplex({
                currentTool: map.currentTool,
                hovered: border.getDataSource('hovered'),
                pressed: border.getDataSource('pressed'),
              }).watch(data => {
                let color = 0;
                if (data.currentTool === i) color = 0xffffff77;
                else if (data.pressed) color = 0xffffff11;
                else if (data.hovered) color = 0xffffff33;
                border.borderColor = color;
              });

              return border;
            })
          )
        ),
        $(View, { background: 0x333344ff, layout: makeVacuumLayout() },
          mapArea = $(View, {
            background: 0x222222ff,
            draw: makeStripeDrawer(sys, 4, 2)
          },
            mapView = $(MapView, { map })
          )
        )
      )

    )
  );



  root.onScroll = (up) => {
    if (up) {
      map.currentTool.val--;
      if (map.currentTool.val < 0) map.currentTool.val = 15;
    }
    else {
      map.currentTool.val++;
      if (map.currentTool.val === 16) map.currentTool.val = 0;
    }
  };
















  sys.root.addChild(panel);

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
    this.terrain[ti] = this.currentTool.val;
  }

}





class MapView extends View {

  showGrid = true;
  map!: Map;

  override init(): void {

    const drawTerrain: ((x: number, y: number) => void)[] = [];


    for (let i = 0; i < 16; i++) {
      drawTerrain.push((x, y) => {
        this.sys.crt.rectFill(x, y, 4, 4, COLORS[i]);
      });
    }

    drawTerrain.push((x, y) => {
      this.sys.crt.rectFill(x, y, 4, 4, COLORS[3]);
    });

    this.w = this.map.width * 4;
    this.h = this.map.height * 4;

    this.cursor = {
      bitmap: new Bitmap([], 0, []),
      offset: [0, 0],
    }

    // sys.rectFill(sys.mouse.x, sys.mouse.y - 2, 1, 5, 0x00000077);
    // sys.rectFill(sys.mouse.x - 2, sys.mouse.y, 5, 1, 0x00000077);
    // sys.pset(sys.mouse.x, sys.mouse.y, 0xffffffff);

    let tilesel: TileSelection | null = null;

    this.onMouseDown = () => {
      if (this.sys.keys[' ']) {
        this.sys.trackMouse({ move: dragMove(this.sys, this) });
      }
      else if (this.sys.keys['Control']) {
        tilesel = new TileSelection(this, 4);

        this.sys.trackMouse({
          move: () => {
            tilesel!.update();

            const tx1 = Math.max(tilesel!.tx1, 0);
            const ty1 = Math.max(tilesel!.ty1, 0);
            const tx2 = Math.min(tilesel!.tx2, this.map.width);
            const ty2 = Math.min(tilesel!.ty2, this.map.height);

            for (let y = ty1; y < ty2; y++) {
              for (let x = tx1; x < tx2; x++) {
                this.map.useTool(x, y);
              }
            }

          },
          up() {
            tilesel = null;
          },
        });
      }
      else if (this.sys.keys['Alt']) {
        this.sys.trackMouse({
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
        this.sys.trackMouse({
          move: () => {
            const x = Math.floor(this.mouse.x / 4);
            const y = Math.floor(this.mouse.y / 4);
            this.map.useTool(x, y);
          },
        });
      }
    };

    this.draw = () => {
      // for (let i = 0; i < 300; i++)
      for (let y = 0; y < this.map.height; y++) {
        for (let x = 0; x < this.map.width; x++) {
          const i = y * this.map.width + x;
          const t = this.map.terrain[i];
          drawTerrain[t](x * 4, y * 4);
        }
      }

      if (this.showGrid) {
        for (let x = 0; x < this.map.width; x++) {
          this.sys.crt.rectFill(x * 4, 0, 1, this.map.height * 4, 0x00000011);
        }

        for (let y = 0; y < this.map.height; y++) {
          this.sys.crt.rectFill(0, y * 4, this.map.width * 4, 1, 0x00000011);
        }
      }

      if (this.hovered) {
        const tx = Math.floor(this.mouse.x / 4);
        const ty = Math.floor(this.mouse.y / 4);
        this.sys.crt.rectFill(tx * 4, ty * 4, 4, 4, 0x0000ff77);

        if (this.sys.keys['Alt']) {
          this.sys.crt.rectFill((tx + 0) * 4, (ty + 1) * 4, 4, 4, 0x0000ff77);
          this.sys.crt.rectFill((tx + 0) * 4, (ty - 1) * 4, 4, 4, 0x0000ff77);
          this.sys.crt.rectFill((tx + 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
          this.sys.crt.rectFill((tx - 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
        }
      }

      if (tilesel) {
        const { tx1, tx2, ty1, ty2 } = tilesel;

        this.sys.crt.rectLine(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
        this.sys.crt.rectFill(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
      }
    }

  }

}
