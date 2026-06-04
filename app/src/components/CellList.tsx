import { useState } from 'react'
import { MartianReport } from '../lib/schema'
import Cell from './Cell'

interface Props {
  report: MartianReport
}

export default function CellList({ report }: Props) {
  const [allCollapsed, setAllCollapsed] = useState(false)

  const sorted = [...report.execution].sort((a, b) => a.call_order - b.call_order)

  return (
    <div className="cell-list-wrapper">
      <div className="controls-bar">
        <button className="ctrl-btn" onClick={() => setAllCollapsed(false)}>expand all</button>
        <button className="ctrl-btn" onClick={() => setAllCollapsed(true)}>collapse all</button>
      </div>
      <div className="cell-list">
        {sorted.map(node => (
          <Cell
            key={node.id}
            report={report}
            node={node}
            forceCollapsed={allCollapsed}
          />
        ))}
      </div>
    </div>
  )
}