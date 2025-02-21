import { Button } from "../controls/button.js";
import { ImageView } from "../controls/image.js";
import { Label } from "../controls/label.js";
import { Bitmap } from "../core/bitmap.js";
import { View } from "../core/view.js";
import { makeVacuumLayout } from "../util/layouts.js";
import { dragMove, dragResize } from "../util/selections.js";
import { Group } from "./group.js";
import { Paned } from "./paned.js";
import { Spaced } from "./spaced.js";

const minImage = new Bitmap([0xffffff33], 3, [0, 0, 0, 0, 0, 0, 1, 1, 1,]);
const maxImage = new Bitmap([0xffffff33], 3, [1, 1, 1, 1, 0, 1, 1, 1, 1,]);
const axeImage = new Bitmap([0x990000ff], 3, [1, 0, 1, 0, 1, 0, 1, 0, 1,]);
const adjImage = new Bitmap([0xffffff11], 3, [0, 0, 1, 0, 0, 1, 1, 1, 1,]);

export class PanelView extends View {

  override background = 0x000000aa;
  override layout = makeVacuumLayout(2);

  title = '';
  content = this.panel.make(View);
  bare = false;

  override init(): void {
    if (this.bare) {
      this.layout = makeVacuumLayout();
      this.children = [this.content];
      return;
    }

    const $ = this.panel.make.bind(this.panel);
    this.children = [

      $(Paned, { dir: 'y', vacuum: 'a' },
        $(Spaced, { padding: 1, onMouseDown: () => { this.sys.trackMouse({ move: dragMove(this.sys, this) }); }, },
          $(Label, { text: this.title, color: 0xffffff33 }),
          $(Group, { gap: 2 },
            $(Button, { onClick: () => this.panel.minimize() }, $(ImageView, { image: minImage })),
            $(Button, { onClick: () => this.panel.maximize() }, $(ImageView, { image: maxImage })),
            $(Button, { onClick: () => this.panel.close() }, $(ImageView, { image: axeImage }))
          )
        ),

        $(Group, { layout: makeVacuumLayout() }, this.content),

      ),

      $(ImageView, {
        passthrough: false,
        image: adjImage,
        layout: function (w, h) { this.x = w - this.w!; this.y = h - this.h!; },
        onMouseDown: () => {
          const resize = dragResize(this.sys, this);
          this.sys.trackMouse({ move: () => { resize(); this.sys.layoutTree(this); } });
        },
      }),

    ];
  }

}
