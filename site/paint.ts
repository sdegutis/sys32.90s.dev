import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Group } from "./crt/group.js";
import { Label } from "./crt/label.js";
import { vacuumLayout } from "./crt/layouts.js";
import { SplitBox } from "./crt/split.js";
import { makeBuilder, System } from "./crt/system.js";
import mapmaker from "./mapmaker.js";
import mapmaker2 from "./mapmaker2.js";


const canvas = document.querySelector('canvas')!;
const screen = new System(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;

const b = makeBuilder(screen);

const area = b(Box, { background: 0x333333ff });
const one = () => { area.children[0] = mapmaker(screen); screen.layoutTree() }
const two = () => { area.children[0] = mapmaker2(screen); screen.layoutTree() }

screen.root.children = [
  b(Box, { layout: vacuumLayout },
    b(SplitBox, { pos: 30, dir: 'y' },
      b(Group, { background: 0x222222ff },
        b(Button, { onClick: one }, b(Label, { text: 'one' })),
        b(Button, { onClick: two }, b(Label, { text: 'two' })),
      ),
      area,
    )
  )
];

two();

screen.layoutTree();
