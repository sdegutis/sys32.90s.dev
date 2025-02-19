import { Box } from "./crt/box.js";
import { demo } from "./crt/checkbox.js";
import { centerLayout, vacuumLayout } from "./crt/layouts.js";
import { makeBuilder, System } from "./crt/system.js";


const canvas = document.querySelector('canvas')!;
const screen = new System(canvas);
screen.autoscale();
screen.root.layout = vacuumLayout;

const b = makeBuilder(screen);

screen.root.children = [
  b(Box, { background: 0x333333ff, layout: centerLayout },
    demo(screen)
  )
];

screen.layoutTree();
