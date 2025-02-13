import { Box, Dragger, drawrect, keys, mouse, pset, root } from "./ui/screen.js";
















class Box2 extends Box {

  dragger: Dragger | null = null;

  tick(delta: number): void {
    super.tick(delta);
    this.dragger?.update();
  }

  onMouseDown(): void {
    this.dragger = new Dragger(this);
  }

  onMouseUp(): void {
    this.dragger = null;
  }

}

class Button extends Box {

  dragger: Dragger | null = null;
  inside = false;
  clicking = false;

  tick(delta: number): void {
    super.tick(delta);
    this.dragger?.update();
  }

  onMouseEnter(): void {
    this.inside = true;
  }

  onMouseExit(): void {
    this.inside = false;
    this.clicking = false;
  }

  onMouseDown(): void {
    if (keys[' ']) this.dragger = new Dragger(box2)
    else this.clicking = true;
  }

  onMouseUp(): void {
    if (this.clicking) {
      this.onClick();
    }
    this.clicking = false;
    this.dragger = null;
  }

  onClick() { }

}

const box1 = new Box(10, 10, 20, 20, '#ff03');
root.children.push(box1);

const box2 = new Box(1, 1, 10, 10, '#0ff3');
box1.children.push(box2);

const button = new Button(0, 0, 5, 5);
box2.children.push(button);

button.onClick = () => {
  console.log('clicked');
};

button.draw = () => {
  let col = '#00f';
  if (button.inside) col = '#0f0';
  if (button.dragger) col = '#f00';
  if (button.clicking) col = '#fff';

  drawrect(0, 0, button.w, button.h, col);
  pset({ x: 0, y: 0 }, '#fff');
};


const cursor = new Box(0, 0, 320, 180);
cursor.draw = () => pset(mouse, '#00f');
root.children.push(cursor);
