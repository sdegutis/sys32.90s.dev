import { PanedXA, PanedYA } from "../../os/containers/paned.js"
import { Button } from "../../os/controls/button.js"
import { Label } from "../../os/controls/label.js"
import { $, View } from "../../os/core/view.js"
import { Panel } from "../../os/desktop/panel.js"
import { makeStripeDrawer } from "../../os/util/draw.js"
import { multiplex } from "../../os/util/events.js"
import { makeFlowLayoutY, makeVacuumLayout } from "../../os/util/layouts.js"
import { EditableMap } from "./map.js"
import { COLORS } from "./mapcolors.js"
import { MapView } from "./mapview.js"

export default () => {

  const map = new EditableMap(50, 40)

  const panel = $(Panel, { title: 'mapmaker', },
    $(View, { layout: makeVacuumLayout(), background: 0xffffff11 },

      $(PanedXA, {
        onScroll: (up) => {
          if (up) {
            map.currentTool.update(map.currentTool.data - 1)
            if (map.currentTool.data < 0) map.currentTool.update(15)
          }
          else {
            map.currentTool.update(map.currentTool.data + 1)
            if (map.currentTool.data === 16) map.currentTool.update(0)
          }
        }
      },
        $(PanedYA, { w: 19, background: 0x333333ff },
          $(Button, {
            background: 0x00000033, padding: 2, onClick: () => {
              const mapView = panel.find<MapView>('mapview')!
              return mapView.showGrid = !mapView.showGrid
            }
          },
            $(Label, { text: 'grid' })
          ),
          $(View, { layout: makeFlowLayoutY() },
            ...COLORS.map((col, i) => {

              const button = $(Button, { padding: 1, onClick: () => { map.currentTool.update(i) } },
                $(View, { passthrough: true, w: 4, h: 4, background: col })
              )

              multiplex({
                currentTool: map.currentTool,
                hovered: button.$data('hovered'),
                pressed: button.$data('pressed'),
              }).watch(data => {
                let color = 0
                if (data.currentTool === i) color = 0xffffff77
                else if (data.pressed) color = 0xffffff11
                else if (data.hovered) color = 0xffffff33
                button.borderColor = color
              })

              return button
            })
          )
        ),
        $(View, { background: 0x333344ff, layout: makeVacuumLayout() },
          $(View, {
            background: 0x222222ff,
            draw: makeStripeDrawer(4, 2)
          },
            $(MapView, { id: 'mapview', map })
          )
        )
      )

    )
  )

  panel.show()

}
