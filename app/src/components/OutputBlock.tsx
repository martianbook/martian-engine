import { useState } from 'react'
import { ExecutionNode, ReturnSummary } from '../lib/schema'

interface Props {
  node: ExecutionNode
}

export default function OutputBlock({ node }: Props) {
  const [open, setOpen] = useState(true)

  const hasArgs   = Object.keys(node.args).length > 0
  const hasStdout = node.stdout.length > 0
  const hasStderr = node.stderr.length > 0
  const hasReturn = node.ret !== null

  return (
    <div className="block block--output">
      <div className="block-label" onClick={() => setOpen(o => !o)}>
        <span className="block-chevron">{open ? '▾' : '▸'}</span>
        <span>output</span>
      </div>
      {open && (
        <div className="block-content">
          {hasArgs && (
            <div className="output-args">
              called with: {Object.entries(node.args).map(([k, v]) => `${k}=${v}`).join(', ')}
            </div>
          )}

          {hasStdout && (
            <div className="output-stdout">
              <pre>{node.stdout.join('\n')}</pre>
            </div>
          )}

          {hasStderr && (
            <div className="output-stderr">
              <pre>{node.stderr.join('\n')}</pre>
            </div>
          )}

          {hasReturn && node.ret && (
            <div className="output-return">
              <ReturnPreview ret={node.ret} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReturnPreview({ ret }: { ret: ReturnSummary }) {
  let label = ret.type_name

  if (ret.shape) {
    label = `${ret.type_name}[${ret.shape.join('×')}]`
  } else if (ret.preview) {
    label = ret.preview.length > 80 ? ret.preview.slice(0, 80) + '…' : ret.preview
  }

  return (
    <span>
      <span className="ret-arrow">→</span> {label}
    </span>
  )
}