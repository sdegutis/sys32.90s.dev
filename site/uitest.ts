import { Box, drawrect, keys, mouse, onMouseMove, pset, rectfill, root } from "./ui/screen.js";
















class Dragger {

  startMouse;
  startElPos;

  constructor(private el: Box) {
    onMouseMove(() => this.update());
    this.startMouse = { ...mouse.point };
    this.startElPos = { ...el.rect };
  }

  update() {
    const offx = this.startMouse.x - this.startElPos.x;
    const offy = this.startMouse.y - this.startElPos.y;
    const diffx = mouse.point.x - this.startElPos.x;
    const diffy = mouse.point.y - this.startElPos.y;
    this.el.rect.x = this.startElPos.x + diffx - offx;
    this.el.rect.y = this.startElPos.y + diffy - offy;
  }

}

class Box2 extends Box {

  dragger: Dragger | null = null;

  col = '#ff0';

  draw(): void {
    rectfill(0, 0, this.rect.w, this.rect.h, this.col);
    super.draw();
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

  draw(): void {
    super.draw();

    let col = '#00f';
    if (button.inside) col = '#0f0';
    if (button.dragger) col = '#f00';
    if (button.clicking) col = '#fff';

    drawrect(0, 0, button.rect.w, button.rect.h, col);
    pset({ x: 0, y: 0 }, '#fff');
  }

  onMouseEnter(): void {
    this.inside = true;
  }

  onMouseExit(): void {
    this.inside = false;
    this.clicking = false;
  }

  onMouseDown(): void {
    if (keys[' ']) this.dragger = new Dragger(this)
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

const box1 = new Box2({ x: 10, y: 10, w: 20, h: 20 });
box1.col = '#ff03';
root.children.push(box1);

const box2 = new Box2({ x: 1, y: 1, w: 10, h: 10 });
box2.col = '#0ff3';
box1.children.push(box2);

const button = new Button({ x: 0, y: 0, w: 5, h: 5 });
box2.children.push(button);

button.onClick = () => {
  console.log('clicked');
};


const cursor = new Box({ x: 0, y: 0, w: 320, h: 180 });
cursor.draw = () => pset(mouse.point, '#00f');
root.children.push(cursor);
