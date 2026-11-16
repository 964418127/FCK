import { v5, gaps5 } from '../src/mock/scheduleV5Store.js'
import { gapSrcOf5, gapRemain5 } from '../src/mock/scheduleV5.js'
for (const sp of v5.spaces) {
  const gs = gaps5(sp.id)
  const map = {}
  gs.forEach(g => { const k = gapSrcOf5(v5, g.slotId, g.date); map[k] = (map[k] || 0) + 1 })
  console.log(sp.id, sp.name, '缺口', gs.length, JSON.stringify(map))
}
console.log('--- S-201 明细 ---')
gaps5('S-201').forEach(g => console.log(g.date, g.slot.name, g.occ + '/' + g.n, gapSrcOf5(v5, g.slotId, g.date)))
