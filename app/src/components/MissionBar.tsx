import { MartianReport } from '../lib/schema'

interface Props {
  report: MartianReport
}

export default function MissionBar({ report }: Props) {
  const fns  = report.execution.length
  const arts = report.artifacts.length
  const excs = report.exceptions.length
  const secs = report.sections.length
  const txts = report.text_nodes.length

  const stats = [
    `${fns} function${fns !== 1 ? 's' : ''}`,
    `${arts} artifact${arts !== 1 ? 's' : ''}`,
    `${excs} exception${excs !== 1 ? 's' : ''}`,
    secs > 0 ? `${secs} section${secs !== 1 ? 's' : ''}` : null,
    txts > 0 ? `${txts} text block${txts !== 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="mission-bar">
      <span className="mission-id">{report.mission.id}</span>
      <span className="mission-stats">{stats}</span>
    </div>
  )
}