import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Group } from "./crt/group.js";
import { Label } from "./crt/label.js";
import { vacuumLayout } from "./crt/layouts.js";
import { RadioButton, RadioGroup } from "./crt/radio.js";
import { TileSelection, dragMove } from "./crt/selections.js";
import { SplitBox } from "./crt/split.js";
import { System, makeBuilder } from "./crt/system.js";

const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];

class ColorButton extends RadioButton {

  color = 0x00000000;

  override draw(): void {
    this.sys.rectFill(this.padding, this.padding, this.size, this.size, this.color);

    if (this.hovered) {
      this.sys.rectLine(0, 0, this.w, this.h, this.border);
    }
    else if (this.checked) {
      this.sys.rectLine(0, 0, this.w, this.h, this.checkColor);
    }
  }

}

export default (screen: System) => {

  const b = makeBuilder(screen);

  let showGrid = true;
  const gridButton = b(Button, {
    onClick: () => showGrid = !showGrid,
  }, b(Label, { text: 'grid' }));

  let currentTool = 5;

  const toolGroup = new RadioGroup();
  toolGroup.onChange = () => {
    const i = toolGroup.buttons.indexOf(toolGroup.selected!);
    currentTool = i;
  }


  const mapArea = b(Box, {
    background: 0x222222ff,
    draw: () => {
      screen.rectFill(0, 0, mapArea.w, mapArea.h, mapArea.background!);
      let off = 0;
      for (let y = 0; y < mapArea.h; y++) {
        for (let x = 0; x < mapArea.w; x += 4) {
          screen.pset(off + x, y, 0x272727ff);
        }
        if (y % 2 === 0) off = (off + 1) % 4;
      }
    }
  });

  const screenroot = b(SplitBox, { vacuum: 'a', dir: 'x' },
    b(Group, { background: 0x333333ff, dir: 'y' },
      gridButton,
      b(Box, { h: 3 }),
      ...COLORS.map((col, i) => b(ColorButton, {
        group: toolGroup,
        color: col,
        size: 4,
        padding: 2,
        w: 6, h: 6,
      })),
    ),
    b(Box, { background: 0x333344ff, layout: vacuumLayout },
      mapArea
    )
  );

  toolGroup.select(toolGroup.buttons[currentTool]);


  screenroot.onScroll = (up) => {
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

    terrain: number[] = [];
    units: number[] = [];

    constructor(
      public width: number,
      public height: number,
    ) {
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
      screen.rectFill(x, y, 4, 4, COLORS[i]);
    });
  }

  drawTerrain.push((x, y) => {
    screen.rectFill(x, y, 4, 4, COLORS[3]);
  });















  const mapBox = new Box(screen);


  let hovered = false;
  mapBox.onMouseEnter = () => hovered = true;
  mapBox.onMouseExit = () => hovered = false;

  mapBox.w = map.width * 4;
  mapBox.h = map.height * 4;
  mapArea.children.push(mapBox);

  mapBox.drawCursor = () => {
    // rectFill(mouse.x, mouse.y - 2, 1, 5, '#0007');
    // rectFill(mouse.x - 2, mouse.y, 5, 1, '#0007');
    // pset(mouse.x, mouse.y, '#fff');
  }

  let tilesel: TileSelection | null = null;

  mapBox.onMouseDown = () => {
    if (screen.keys[' ']) {
      screen.trackMouse({ move: dragMove(screen, mapBox) });
    }
    else if (screen.keys['Control']) {
      tilesel = new TileSelection(mapBox, 4);

      screen.trackMouse({
        move() {
          tilesel!.update();

          const { tx1, tx2, ty1, ty2 } = tilesel!;

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
    else if (screen.keys['Alt']) {
      screen.trackMouse({
        move() {
          const x = Math.floor(mapBox.mouse.x / 4);
          const y = Math.floor(mapBox.mouse.y / 4);
          map.useTool(x + 0, y + 0);
          map.useTool(x + 1, y + 0);
          map.useTool(x - 1, y + 0);
          map.useTool(x + 0, y + 1);
          map.useTool(x + 0, y - 1);
        },
      });
    }
    else {
      screen.trackMouse({
        move() {
          const x = Math.floor(mapBox.mouse.x / 4);
          const y = Math.floor(mapBox.mouse.y / 4);
          map.useTool(x, y);
        },
      });
    }
  };

  mapBox.draw = () => {
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
        screen.rectFill(x * 4, 0, 1, map.height * 4, 0x00000011);
      }

      for (let y = 0; y < map.height; y++) {
        screen.rectFill(0, y * 4, map.width * 4, 1, 0x00000011);
      }
    }

    if (hovered) {
      const tx = Math.floor(mapBox.mouse.x / 4);
      const ty = Math.floor(mapBox.mouse.y / 4);
      screen.rectFill(tx * 4, ty * 4, 4, 4, 0x0000ff77);

      if (screen.keys['Alt']) {
        screen.rectFill((tx + 0) * 4, (ty + 1) * 4, 4, 4, 0x0000ff77);
        screen.rectFill((tx + 0) * 4, (ty - 1) * 4, 4, 4, 0x0000ff77);
        screen.rectFill((tx + 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
        screen.rectFill((tx - 1) * 4, (ty + 0) * 4, 4, 4, 0x0000ff77);
      }
    }

    if (tilesel) {
      const { tx1, tx2, ty1, ty2 } = tilesel;

      screen.rectLine(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
      screen.rectFill(tx1 * 4, ty1 * 4, 4 * (tx2 - tx1), 4 * (ty2 - ty1), 0x0000ff33);
    }
  }

  return screenroot;

};
