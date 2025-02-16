import { Box, Button, Mover, RadioButton, RadioGroup, Screen, sys, TileSelection } from "./ui.js";




class TabBox extends Box {

  #allChildren: Box[] = [];

  tab = -1;

  addTab(box: Box) {
    this.#allChildren.push(box);
    this.children = [box];
    this.tab = this.children.length - 1;
  }

  select(t: number) {
    this.tab = t;
    this.children = [this.#allChildren[this.tab]];
  }

}


const tabBox = new TabBox(40, 8, 320 - 40, 180 - 8, 0x222222ff);
sys.root.children.push(tabBox);





const mapArea2 = new Box(0, 0, 320 - 40, 180 - 8, 0x000033ff);
tabBox.addTab(mapArea2);
mapArea2.onMouseDown = () => console.log('haha nope');




const menu = new Box(0, 0, 320, 8, 0x000000ff);
sys.root.children.push(menu);

const saveButton = new Button(0, 0, 4 * 4 + 3, 8, 0x000000ff);
saveButton.color = 0xffffff33;
saveButton.text = 'save';
saveButton.onClick = () => {
  console.log('saving')
};
menu.children.push(saveButton);

const loadButton = new Button(20, 0, 4 * 4 + 3, 8, 0x000000ff);
loadButton.color = 0xffffff33;
loadButton.text = 'load';
loadButton.onClick = () => {
  console.log('loading')
};
menu.children.push(loadButton);

let showGrid = true;

const gridButton = new Button(40, 0, 4 * 4 + 3, 8, 0x000000ff);
gridButton.color = 0xffffff33;
gridButton.text = 'grid';
gridButton.onClick = () => tabBox.select((tabBox.tab + 1) % 2);
// gridButton.onClick = () => showGrid = !showGrid;
menu.children.push(gridButton);






const toolArea = new Box(0, 8, 40, 180 - 8, 0x333333ff);
sys.root.children.push(toolArea);













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

const drawTerrain: ((screen: Screen, x: number, y: number) => void)[] = [];

let currentTool = 5;


const toolGroup = new RadioGroup();

for (let i = 0; i < 16; i++) {
  drawTerrain.push((screen, x, y) => {
    screen.rectFill(x, y, 4, 4, COLORS[i]);
  });
}

drawTerrain.push((screen, x, y) => {
  screen.rectFill(x, y, 4, 4, COLORS[3]);
});

for (let i = 0; i < 17; i++) {

  const maxlen = 24;
  let toolx = Math.floor(i / maxlen) * 7;
  let tooly = (i % maxlen) * 7;

  const b = new RadioButton(toolx, tooly, 8, 8);
  b.drawButton = (screen) => screen.rectFill(2, 2, 4, 4, COLORS[i % 16]);
  toolGroup.add(b);
  b.onSelect = () => currentTool = i;
  toolArea.children.push(b);

  if (i === currentTool) toolGroup.select(b);

}



sys.root.onScroll = up => {
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















const mapArea = new Box(0, 0, 320 - 40, 180 - 8, 0x222222ff);
mapArea.clips = true;
tabBox.addTab(mapArea);

mapArea.drawContents = (screen) => {
  screen.rectFill(0, 0, mapArea.w, mapArea.h, mapArea.background!);
  let off = 0;
  for (let y = 0; y < mapArea.h; y++) {
    for (let x = 0; x < mapArea.w; x += 4) {
      screen.pset(off + x, y, 0x272727ff);
    }
    if (y % 2 === 0) off = (off + 1) % 4;
  }
};

const mapBox = new Box(0, 0, map.width * 4, map.height * 4);
mapArea.children.push(mapBox);

mapBox.drawCursor = () => {
  // rectFill(mouse.x, mouse.y - 2, 1, 5, '#0007');
  // rectFill(mouse.x - 2, mouse.y, 5, 1, '#0007');
  // pset(mouse.x, mouse.y, '#fff');
}

let tilesel: TileSelection | null = null;

mapBox.onMouseDown = () => {
  if (sys.keys[' ']) {
    const dragger = new Mover(mapBox);
    mapBox.trackMouse({ move: () => dragger.update() });
  }
  else if (sys.keys['Control']) {
    tilesel = new TileSelection(mapBox, 4);

    mapBox.trackMouse({
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
  else if (sys.keys['Alt']) {
    mapBox.trackMouse({
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
    mapBox.trackMouse({
      move() {
        const x = Math.floor(mapBox.mouse.x / 4);
        const y = Math.floor(mapBox.mouse.y / 4);
        map.useTool(x, y);
      },
    });
  }
};

mapBox.draw = (screen) => {
  // for (let i = 0; i < 300; i++)
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const i = y * map.width + x;
      const t = map.terrain[i];
      drawTerrain[t](screen, x * 4, y * 4);
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

    if (sys.keys['Alt']) {
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




// const textbox = new TextField(160, 10, 60, 80, 0x000000ff);
// textbox.text = `#include blobbycode.p8`;
// root.children.push(textbox);

// const checkbox = new Checkbox(160, 1, 8 + 4 * 7, 6, 0x000000ff);
// root.children.push(checkbox);
// checkbox.onChange = () => console.log(checkbox.checked)
// checkbox.checked = true;
// checkbox.children.push(new Label('testing', 8, 1, 4 * 7, 6));

tabBox.select(1);
