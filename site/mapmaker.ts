import { Box, MouseTracker, Screen, TileSelection, dragMove } from "./crt/crt.js";



class Button extends Box {

  text = '';
  color: number = 0xffffffff;

  clicking = false;
  onClick() { }

  onMouseDown(trackMouse: MouseTracker): void {
    this.clicking = true;

    const cancel = trackMouse({
      move: () => {
        if (!this.hovered) {
          cancel();
          this.clicking = false;
        }
      },
      up: () => {
        this.onClick();
        this.clicking = false;
      },
    });
  }

  draw(): void {
    if (this.clicking) {
      this.screen.rectFill(0, 0, this.w, this.h, 0xffffff22);
    }
    else if (this.hovered) {
      this.screen.rectFill(0, 0, this.w, this.h, 0xffffff11);
    }

    this.screen.print(2, 2, this.color, this.text);
  }

}

class RadioGroup {

  buttons: RadioButton[] = [];

  add(button: RadioButton) {
    this.buttons.push(button);
    button.group = this;
  }

  select(button: RadioButton) {
    for (const b of this.buttons) {
      b.selected = (b === button);
    }
  }

}

class RadioButton extends Button {

  drawButton() { }
  onSelect() { }

  selected = false;
  group?: RadioGroup;

  onClick(): void {
    super.onClick();
    this.group?.select(this);
    this.onSelect();
  }

  draw(): void {
    this.drawButton();

    if (this.selected) {
      this.screen.rectLine(0, 0, this.w, this.h, 0xffffff77);
    }
    else if (this.hovered) {
      this.screen.rectLine(0, 0, this.w, this.h, 0xffffff33);
    }
  }

}



const canvas = document.querySelector('canvas')!;
canvas.width = 320;
canvas.height = 180;
const screen = new Screen(canvas);
screen.autoscale();

screen.root.onKeyDown = k => console.log(k.toUpperCase())

const menu = new Box(screen);
menu.w = 320;
menu.h = 8;
menu.background = 0x000000ff;
screen.root.children.push(menu);

const saveButton = new Button(screen);
saveButton.w = 4 * 4 + 3;
saveButton.h = 8;
saveButton.background = 0x000000ff;
saveButton.color = 0xffffff33;
saveButton.text = 'save';
saveButton.onClick = () => {
  console.log('saving')
};
menu.children.push(saveButton);

const loadButton = new Button(screen);
loadButton.x = 20;
loadButton.w = 4 * 4 + 3;
loadButton.h = 8;
loadButton.background = 0x000000ff;
loadButton.color = 0xffffff33;
loadButton.text = 'load';
loadButton.onClick = () => {
  console.log('loading')
};
menu.children.push(loadButton);

let showGrid = true;

const gridButton = new Button(screen);
gridButton.x = 40;
gridButton.w = 4 * 4 + 3;
gridButton.h = 8;
gridButton.background = 0x000000ff;
gridButton.color = 0xffffff33;
gridButton.text = 'grid';
gridButton.onClick = () => showGrid = !showGrid;
menu.children.push(gridButton);






const toolArea = new Box(screen);
toolArea.y = 8;
toolArea.w = 40;
toolArea.h = 180 - 8;
toolArea.background = 0x333333ff;
screen.root.children.push(toolArea);













const COLORS = [
  0x000000ff, 0x1D2B53ff, 0x7E2553ff, 0x008751ff,
  0xAB5236ff, 0x5F574Fff, 0xC2C3C7ff, 0xFFF1E8ff,
  0xFF004Dff, 0xFFA300ff, 0xFFEC27ff, 0x00E436ff,
  0x29ADFFff, 0x83769Cff, 0xFF77A8ff, 0xFFCCAAff,
];

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

let currentTool = 5;


const toolGroup = new RadioGroup();

for (let i = 0; i < 16; i++) {
  drawTerrain.push((x, y) => {
    screen.rectFill(x, y, 4, 4, COLORS[i]);
  });
}

drawTerrain.push((x, y) => {
  screen.rectFill(x, y, 4, 4, COLORS[3]);
});

for (let i = 0; i < 17; i++) {

  const maxlen = 24;
  let toolx = Math.floor(i / maxlen) * 7;
  let tooly = (i % maxlen) * 7;

  const b = new RadioButton(screen);
  b.x = toolx;
  b.y = tooly;
  b.w = 8;
  b.h = 8;
  b.drawButton = () => screen.rectFill(2, 2, 4, 4, COLORS[i % 16]);
  toolGroup.add(b);
  b.onSelect = () => currentTool = i;
  toolArea.children.push(b);

  if (i === currentTool) toolGroup.select(b);

}



screen.root.onScroll = (up) => {
  if (up) {
    currentTool--;
    if (currentTool < 0) currentTool = 16;
  }
  else {
    currentTool++;
    if (currentTool === 17) currentTool = 0;
  }

  toolGroup.select(toolGroup.buttons[currentTool]);
};















const mapArea = new Box(screen);
mapArea.x = 40;
mapArea.y = 8;
mapArea.w = 320 - 40;
mapArea.h = 180 - 8;
mapArea.background = 0x222222ff;
screen.root.children.push(mapArea);

mapArea.draw = () => {
  screen.rectFill(0, 0, mapArea.w, mapArea.h, mapArea.background!);
  let off = 0;
  for (let y = 0; y < mapArea.h; y++) {
    for (let x = 0; x < mapArea.w; x += 4) {
      screen.pset(off + x, y, 0x272727ff);
    }
    if (y % 2 === 0) off = (off + 1) % 4;
  }
};

const mapBox = new Box(screen);
mapBox.w = map.width * 4;
mapBox.h = map.height * 4;
mapArea.children.push(mapBox);

mapBox.drawCursor = () => {
  // rectFill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  // rectFill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  // pset(mouse.x, mouse.y, '#fff');
}

let tilesel: TileSelection | null = null;

mapBox.onMouseDown = (trackMouse) => {
  if (screen.keys[' ']) {
    trackMouse({ move: dragMove(screen, mapBox) });
  }
  else if (screen.keys['Control']) {
    tilesel = new TileSelection(mapBox, 4);

    trackMouse({
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
    trackMouse({
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
    trackMouse({
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

  if (mapBox.hovered) {
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
