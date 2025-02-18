import { Box, MouseTracker } from "./crt/box.js";
import { Font } from "./crt/font.js";
import { makeFlowLayout, vacuumLayout } from "./crt/layouts.js";
import { Screen } from "./crt/screen.js";
import { SplitBox } from "./crt/split.js";



{
  const canvas = document.querySelector('canvas')!;
  // canvas.width = 320 * 2;
  // canvas.height = 180 * 2;
  const screen = new Screen(canvas);
  screen.autoscale();

  screen.root.layout = vacuumLayout;

  const split = new SplitBox(screen);
  split.pos = 10;
  split.min = 8;
  split.max = 18;
  split.dir = 'y';

  const red = new BorderBox(screen); red.background = 0x330000ff; red.border = 0xffffff00;
  const green = new BorderBox(screen); green.background = 0x003300ff; green.border = 0xffffff00;
  const blue = new BorderBox(screen); blue.background = 0x000033ff; blue.border = 0xffffff00;

  const split2 = new SplitBox(screen);
  split2.resizable = true;
  split2.pos = 30;
  split2.min = 28;
  split2.max = 38;
  split2.dir = 'x';

  screen.root.children.push(split);

  split.a.layout = vacuumLayout;
  split.b.layout = vacuumLayout;
  split2.a.layout = vacuumLayout;
  split2.b.layout = vacuumLayout;

  split.a.children.push(blue);
  split.b.children.push(split2);

  split2.a.children.push(red);
  split2.b.children.push(green);

  split.resizable = true;







  // // static props: Property[] = [
  // //   { name: 'x', type: 'number' },
  // //   { name: 'y', type: 'number' },
  // //   { name: 'w', type: 'number' },
  // //   { name: 'h', type: 'number' },
  // //   { name: 'background', type: 'color' },
  // // ];

  // // export type Property = {
  // //   name: string,
  // //   type: 'number' | 'string' | 'color' | 'boolean',
  // // };

  //   class GridBox extends Box {

  //     // static props: Property[] = [
  //     //   ...super.props,
  //     //   { name: 'id', type: 'string' },
  //     // ];

  //   }

  //   // console.log(GridBox.props)






  class BorderBox extends Box {

    border = 0xffffff33;

    draw(): void {
      this.screen.rectLine(0, 0, this.w, this.h, this.border);
    }

  }

  class Label extends Box {

    #text = '';
    font = Font.crt2025;
    padding = 1;
    passthrough = true;

    constructor(screen: Screen, text: string) {
      super(screen);
      this.text = text;
    }

    get text() { return this.#text; }
    set text(s: string) {
      this.#text = s;
      const size = this.font.calcSize(s);
      this.w = size.w + this.padding * 2;
      this.h = size.h + this.padding * 2;
    }

    draw() {
      this.screen.print(this.padding, this.padding, 0xffffffff, this.text);
    }

  }


  class Button extends BorderBox {

    padding = 1;
    pressColor = 0x00000033;
    hoverColor = 0x00000000;

    onClick?(): void;

    pressed = false;

    children: Box[] = [new Label(screen, 'button')];

    get child() { return this.children[0]; }
    set child(child: Box) {
      this.children = [child];
      child.x = this.padding;
      child.y = this.padding;
      this.w = child.w + this.padding * 2;
      this.h = child.h + this.padding * 2;
    }

    onMouseDown(trackMouse: MouseTracker): void {
      this.pressed = true;
      trackMouse({
        move: () => {
          if (!this.hovered) {
            this.pressed = false;
          }
        },
        up: () => {
          if (this.pressed) {
            this.onClick?.();
          }
          this.pressed = false;
        },
      });
    }

    draw(): void {
      super.draw();
      if (this.pressed) {
        this.screen.rectFill(0, 0, this.w, this.h, this.pressColor);
      }
      else if (this.hovered) {
        this.screen.rectFill(0, 0, this.w, this.h, this.hoverColor);
      }
    }

  }

  const button = new Button(screen);
  button.x = 30;
  button.y = 30;
  button.background = 0x00000033;
  button.border = 0xff000033;
  green.children.push(button);

  const label = new Label(screen, 'yes \\n no');

  button.child = label;
  button.onClick = () => console.log('clicked')

  // button.children.push(label);



  green.background = 0x222222ff;

  const button2 = new Button(screen);
  button2.padding = 2;
  button2.x = 90;
  button2.y = 30;
  button2.background = 0x00000033;
  button2.border = 0x999999ff;
  green.children.push(button2);


  // button2.onMouseDown = (t) => {
  //   t({
  //     move: () => {

  //     },
  //     up: () => {
  //       screen.pset(screen.mouse.x, screen.mouse.y, 0xffffff99)
  //       console.log(screen.#hovered.mouse.x, screen.#hovered.mouse.y, screen.#hovered)

  //     },
  //   })
  // };

  const b = new Box(screen);
  b.background = 0x990000ff;
  b.passthrough = true;
  b.w = 3;
  b.h = 3;
  button2.child = b;



  green.layout = makeFlowLayout(3, 3);

  screen.layoutTree();

}
