import { Box, MouseTracker, Screen, TileSelection, dragMove, dragResize } from "./crt.js";


const screen = new Screen(document.querySelector('canvas')!);
screen.autoscale();


class Button extends Box {

  text = '';
  color: number = 0xffffffff;

  clicking = false;
  onClick() { }

  onMouseDown = (trackMouse: MouseTracker) => {
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
  };

  draw = () => {
    if (this.clicking) {
      this.screen.rectFill(0, 0, this.w, this.h, 0xffffff22);
    }
    else if (this.hovered) {
      this.screen.rectFill(0, 0, this.w, this.h, 0xffffff11);
    }

    this.screen.print(2, 2, this.color, this.text);
  };

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

  draw = () => {
    this.drawButton();

    if (this.selected) {
      this.screen.rectLine(0, 0, this.w, this.h, 0xffffff77);
    }
    else if (this.hovered) {
      this.screen.rectLine(0, 0, this.w, this.h, 0xffffff33);
    }
  };

}


class Label extends Box {

  color = 0xffffffff;

  passthrough = true;

  text = '';

  draw = () => {
    this.screen.print(0, 0, this.color, this.text);
  };

}

class Checkbox extends Box {

  checked = false;

  onChange() { }

  draw = () => {
    this.screen.rectLine(0, 0, 6, 6, this.hovered ? 0xffffffff : 0x777777ff);
    if (this.checked) {
      this.screen.rectFill(2, 2, 2, 2, 0xffffffff);
    }
  };

  onMouseDown = () => {
    this.checked = !this.checked;
    this.onChange();
  };

}

class TextField extends Box {

  text = '';
  color = 0xffffffff;

  onScroll = (up: boolean) => {
    console.log('scrolling', up)
  };

  onKeyDown = (key: string) => {
    if (key === 'Enter') {
      this.text += '\n';
    }
    else if (key === 'Backspace') {
      this.text = this.text.slice(0, -1);
    }
    else {
      this.text += key;
    }
    this.restartBlinking();
  };

  // onMouseDown(): void {
  //   this.trackMouse({
  //     move: () => console.log(this.mouse)
  //   });
  // }

  draw = () => {
    this.screen.print(2, 2, this.color, this.text);

    if (this.screen.focused === this) {
      this.screen.rectLine(0, 0, this.w, this.h, 0xffffff33);

      if (this.blinkShow) {
        let cx = 0;
        let cy = 0;

        for (let i = 0; i < this.text.length; i++) {
          const ch = this.text[i];
          if (ch === '\n') { cy++; cx = 0; continue; }
          cx++;
        }

        this.screen.print((cx * 4) + 2, (cy * 6) + 2, 0x77aaffff, '_');
      }
    }
  };

  blink?: number;
  blinkShow = false;

  restartBlinking() {
    this.stopBlinking();
    this.blinkShow = true;
    this.blink = setInterval(() => {
      this.blinkShow = !this.blinkShow;
      this.screen.needsRedraw = true;
    }, 500);
  }

  stopBlinking() {
    clearInterval(this.blink);
  }

  onFocus = () => {
    this.restartBlinking();
  };

  onUnfocus = () => {
    this.stopBlinking();
  };

}

class TabBox extends Box {

  tab = -1;
  #realChildren: Box[] = [];

  addTab(box: Box) {
    this.children = this.#realChildren;
    this.addChild(box);
    this.select(this.children.length - 1);
  }

  select(t: number) {
    this.tab = t;
    this.children = [this.#realChildren[this.tab]];
  }

}



const tabBox = new TabBox();
tabBox.x = 40;
tabBox.y = 8;
tabBox.w = 320 - 40;
tabBox.h = 180 - 8;
tabBox.background = 0x222222ff;
screen.root.addChild(tabBox);





const mapArea2 = new Box();
mapArea2.w = 320 - 40;
mapArea2.h = 180 - 8;
mapArea2.background = 0x000033ff;
tabBox.addTab(mapArea2);
mapArea2.onMouseDown = () => console.log('haha nope');




const menu = new Box();
menu.w = 320;
menu.h = 8;
menu.background = 0x000000ff;
screen.root.addChild(menu);

const saveButton = new Button();
saveButton.w = 4 * 4 + 3;
saveButton.h = 8;
saveButton.background = 0x000000ff;
saveButton.color = 0xffffff33;
saveButton.text = 'save';
saveButton.onClick = () => {
  console.log('saving')
};
menu.addChild(saveButton);

const loadButton = new Button();
loadButton.x = 20;
loadButton.w = 4 * 4 + 3;
loadButton.h = 8;
loadButton.background = 0x000000ff;
loadButton.color = 0xffffff33;
loadButton.text = 'load';
loadButton.onClick = () => {
  console.log('loading')
};
menu.addChild(loadButton);

let showGrid = true;

const gridButton = new Button();
gridButton.x = 40;
gridButton.w = 4 * 4 + 3;
gridButton.h = 8;
gridButton.background = 0x000000ff;
gridButton.color = 0xffffff33;
gridButton.text = 'grid';
gridButton.onClick = () => showGrid = !showGrid;
menu.addChild(gridButton);

const tabButton = new Button();
tabButton.x = 60;
tabButton.w = 4 * 4 + 3;
tabButton.h = 8;
tabButton.background = 0x000000ff;
tabButton.color = 0xffffff33;
tabButton.text = 'tabs';
tabButton.onClick = () => tabBox.select((tabBox.tab + 1) % 2);
menu.addChild(tabButton);






const toolArea = new Box();
toolArea.y = 8;
toolArea.w = 40;
toolArea.h = 180 - 8;
toolArea.background = 0x333333ff;
screen.root.addChild(toolArea);













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

  const b = new RadioButton();
  b.x = toolx;
  b.y = tooly;
  b.w = 8;
  b.h = 8;
  b.drawButton = () => screen.rectFill(2, 2, 4, 4, COLORS[i % 16]);
  toolGroup.add(b);
  b.onSelect = () => currentTool = i;
  toolArea.addChild(b);

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















const mapArea = new Box();
mapArea.w = 320 - 40;
mapArea.h = 180 - 8;
mapArea.background = 0x222222ff;
tabBox.addTab(mapArea);

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

const mapBox = new Box();
mapBox.w = map.width * 4;
mapBox.h = map.height * 4;
mapArea.addChild(mapBox);

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



const textbox = new TextField();
textbox.x = 10;
textbox.y = 25;
textbox.w = 50;
textbox.h = 20;
textbox.background = 0x000000ff;
textbox.text = `test`;

textbox.onMouseMove = () => { console.log('move', textbox.mouse); }
textbox.onMouseEnter = () => { console.log('enter', textbox.mouse); }
textbox.onMouseExit = () => { console.log('exit', textbox.mouse); }

const checkbox = new Checkbox();
checkbox.x = 160;
checkbox.y = 1;
checkbox.w = 8 + 4 * 7;
checkbox.h = 6;
checkbox.background = 0x000000ff;
screen.root.addChild(checkbox);
checkbox.onChange = () => console.log(checkbox.checked)
checkbox.checked = true;

const label = new Label();
label.text = 'testing';
label.x = 8;
label.y = 1;
label.w = 4 * 7;
label.h = 6;
checkbox.addChild(label);

export class Slider extends Box {

  value = 0;
  min = 0;
  max = 10;

  draw = () => {
    const p = this.value / this.max * this.w;
    console.log(p)
    this.screen.pset(p, 1, 0xfffffffff);
  };

  onMouseDown = (trackMouse: MouseTracker) => {
    trackMouse({
      move: () => {
        this.value = this.mouse.x / this.w * this.max;
      }
    });
  };

}

const slider = new Slider();
slider.x = 60;
slider.y = 40;
slider.w = 8 + 4 * 7;
slider.h = 6;
slider.background = 0x000000ff;
screen.root.addChild(slider);

const test1 = new Box();
test1.x = 100;
test1.y = 100;
test1.w = 70;
test1.h = 60;
test1.draw = () => {
  screen.rectFill(1, 1, test1.w - 2, test1.h - 2, 0x00000099);

  screen.rectLine(0, 0, test1.w, test1.h, 0xffffff77)

  // screen.rectFill(1, 0, test1.w - 2, 1, 0x00000099);
  // screen.rectFill(1, test1.h - 1, test1.w - 2, 1, 0x00000099);
  // screen.rectFill(0, 1, 1, test1.h - 2, 0x00000099);
  // screen.rectFill(test1.w - 1, 1, 1, test1.h - 2, 0x00000099);

  // screen.rectFill(1, 0, test1.w - 2, 1, 0xffffff77);
  // screen.rectFill(1, test1.h - 1, test1.w - 2, 1, 0xffffff77);
  // screen.rectFill(0, 1, 1, test1.h - 2, 0xffffff77);
  // screen.rectFill(test1.w - 1, 1, 1, test1.h - 2, 0xffffff77);

  screen.print(3, 3, 0xffffff44, 'test window')
  screen.rectFill(1, 9, test1.w - 2, 1, 0xffffff77);

  screen.pset(test1.w - 3, test1.h - 3, 0xffffffff)
};
test1.onMouseDown = (trackMouse) => {
  if (test1.mouse.x >= test1.w - 3 && test1.mouse.y >= test1.h - 3) {
    trackMouse({ move: dragResize(screen, test1) });
  }
  else if (test1.mouse.y < 10) {
    trackMouse({ move: dragMove(screen, test1) });
  }
};
screen.root.addChild(test1);

const b1 = new Button();
b1.x = 3; b1.y = 15; b1.w = 20; b1.h = 10;
b1.text = 'hmm';
test1.addChild(b1)
test1.addChild(textbox);

// screen.root.draw = () => {

//   for (let y = 0; y < 180; y++) {
//     for (let x = 0; x < 320; x++) {
//       screen.pset(x, y, Math.floor(Math.random() * 0xffffffff))
//     }
//   }

//   screen.needsRedraw = true;

// };
