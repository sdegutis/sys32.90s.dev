import { PanedXA, PanedYA } from "../sys32/containers/paned.js";
import { Button } from "../sys32/controls/button.js";
import { Label } from "../sys32/controls/label.js";
import { RadioButton, RadioGroup } from "../sys32/controls/radio.js";
import { Bitmap } from "../sys32/core/bitmap.js";
import { System } from "../sys32/core/system.js";
import { View } from "../sys32/core/view.js";
import { Panel } from "../sys32/desktop/panel.js";
import { makeFlowLayoutY, makeVacuumLayout } from "../sys32/util/layouts.js";
import { TileSelection, dragMove } from "../sys32/util/selections.js";
import { makeStripeMotifDraw } from "./util/motif.js";

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];

class ColorButton extends RadioButton {

  color = 0x00000000;

  override draw(): void {
    this.sys.crt.rectFill(this.padding, this.padding, this.size, this.size, this.color);

    if (this.checked) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, this.checkColor);
    }
    else if (this.hovered) {
      this.sys.crt.rectLine(0, 0, this.w, this.h, 0xffffff77);
    }
  }

}

export default (sys: System) => {
  const panel = sys.make(Panel, {
    title: 'mapmaker',
  },
    sys.make(View, { layout: makeVacuumLayout(), background: 0xffffff11 },
      mapmaker(sys)
    )
  );
  sys.root.addChild(panel);
  sys.focus(panel);
};

export function mapmaker(sys: System) {
  let showGrid = true;
  const gridButton = sys.make(Button, {
    onClick: () => showGrid = !showGrid,
  }, sys.make(Label, { padding: 2, text: 'grid', background: 0x00000033 }));

  let currentTool = 5;

  const toolGroup = new RadioGroup();
  toolGroup.onChange = () => {
    const i = toolGroup.buttons.indexOf(toolGroup.selected!);
    currentTool = i;
  }


  const mapArea = sys.make(View, {
    background: 0x222222ff,
    draw: makeStripeMotifDraw(sys, 4, 2)
  });

  const root = sys.make(PanedXA, {},
    sys.make(PanedYA, { w: 19, background: 0x333333ff },
      gridButton,
      sys.make(View, { layout: makeFlowLayoutY() },
        ...COLORS.map((col, i) => sys.make(ColorButton, {
          group: toolGroup,
          color: col,
          size: 4,
          padding: 1,
          w: 6, h: 6,
        }))
      )
    ),
    sys.make(View, { background: 0x333344ff, layout: makeVacuumLayout() },
      mapArea
    )
  );

  toolGroup.select(toolGroup.buttons[currentTool]);


  root.onScroll = (up) => {
    if (up) {
      currentTool--;
      if (currentTool < 0) currentTool = 15;
    }
    else {
      currentTool++;
      if (currentTool === 16) currentTool = 0;
    }
    toolGroup.select(toolGroup.buttons[currentTool]);
  };




  class Map {

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
      this.terrain[ti] = currentTool;
    }

  }

  const map = new Map(50, 40);

  const drawTerrain: ((x: number, y: number) => void)[] = [];


  for (let i = 0; i < 16; i++) {
    drawTerrain.push((x, y) => {
      sys.crt.rectFill(x, y, 4, 4, COLORS[i]);
    });
  }

  drawTerrain.push((x, y) => {
    sys.crt.rectFill(x, y, 4, 4, COLORS[3]);
  });















  const mapView = sys.make(View, {});


  let hovered = false;
  mapView.onMouseEnter = () => hovered = true;
  mapView.onMouseExit = () => hovered = false;

  mapView.w = map.width * 4;
  mapView.h = map.height * 4;
  mapArea.addChild(mapView);

  mapView.cursor = {
    bitmap: new Bitmap([], 0, []),
    offset: [0, 0],
  }

  // sys.rectFill(sys.mouse.x, sys.mouse.y - 2, 1, 5, 0x00000077);
  // sys.rectFill(sys.mouse.x - 2, sys.mouse.y, 5, 1, 0x00000077);
  // sys.pset(sys.mouse.x, sys.mouse.y, 0xffffffff);

  let tilesel: TileSelection | null = null;

  mapView.onMouseDown = () => {
    if (sys.keys[' ']) {
      sys.trackMouse({ move: dragMove(sys, mapView) });
    }
    else if (sys.keys['Control']) {
      tilesel = new TileSelection(mapView, 4);

      sys.trackMouse({
        move() {
          tilesel!.update();

          const tx1 = Math.max(tilesel!.tx1, 0);
          const ty1 = Math.max(tilesel!.ty1, 0);
          const tx2 = Math.min(tilesel!.tx2, map.width);
          const ty2 = Math.min(tilesel!.ty2, map.height);

          for (let y = ty1; y < ty2; y++) {
            for (let x = tx1; x < tx2; x++) {
              map.useTool(x, y);
            }
          }

        },
        up() {
          tilesel = null;
        },
      });
    }
    else if (sys.keys['Alt']) {
      sys.trackMouse({
        move() {
          const x = Math.floor(mapView.mouse.x / 4);
          const y = Math.floor(mapView.mouse.y / 4);
          map.useTool(x + 0, y + 0);
          map.useTool(x + 1, y + 0);
          map.useTool(x - 1, y + 0);
          map.useTool(x + 0, y + 1);
          map.useTool(x + 0, y - 1);
        },
      });
    }
    else {
      sys.trackMouse({
        move() {
          const x = Math.floor(mapView.mouse.x / 4);
          const y = Math.floor(mapView.mouse.y / 4);
          map.useTool(x, y);
        },
      });
    }
  };

  mapView.draw = () => {
    // for (let i = 0; i < 300; i++)
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const i = y * map.width + x;
        const t = map.terrain[i];
        drawTerrain[t](x * 4, y * 4);
      }
    }

    if (showGrid) {
      for (let x = 0; x < map.width; x++) {
        sys.crt.rectFill(x * 4, 0, 1, map.height * 4, 0x00000011);
      }

      for (let y = 0; y < map.height; y++) {
        sys.crt.rectFill(0, y * 4, map.width * 4, 1, 0x00000011);
      }
    }

    if (hovered) {
      const tx = Math.floor(mapView.mouse.x / 4);
      const ty = Math.floor(mapView.mouse.y / 4);
      sys.crt.rectFill(tx * 4, ty * 4, 4, 4, 0x0000ff77);

      if (sys.keys['Alt']) {
        sys.crt.rectFill((tx + 0) * 4, (ty + 1) * 4, 4, 4, 0x0000ff77);
        sys.crt.rectFill((tx + 0) * 4, (ty - 1) * 4, 4, 4, 0x0000ff77);
        sys.crt.rectFill((tx + 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
        sys.crt.rectFill((tx - 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
      }
    }

    if (tilesel) {
      const { tx1, tx2, ty1, ty2 } = tilesel;

      sys.crt.rectLine(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
      sys.crt.rectFill(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
    }
  }

  return root;
}
