import { Box } from "./crt/box.js";
import { Button } from "./crt/button.js";
import { Group } from "./crt/group.js";
import { Label } from "./crt/label.js";
import { vacuumLayout } from "./crt/layouts.js";
import { SplitBox } from "./crt/split.js";
import { makeBuilder, System } from "./crt/system.js";
import mapmaker from "./mapmaker.js";


const canvas = document.querySelector('canvas')!;
const sys = new System(canvas);
sys.resize(320 * 2, 180 * 2);
sys.autoscale();
sys.root.layout = vacuumLayout;

const b = makeBuilder(sys);

const area = b(Box, { background: 0x333333ff, layout: vacuumLayout });
const one = () => { area.children = [mapmaker(sys)]; sys.layoutTree() }

sys.root.children = [
  b(Box, { layout: vacuumLayout },
    b(SplitBox, { vacuum: 'a', dir: 'y' },
      b(Group, { background: 0x222222ff },
        b(Button, { onClick: one }, b(Label, { text: 'one' })),
      ),
      area,
    )
  )
];

one();

sys.layoutTree();
