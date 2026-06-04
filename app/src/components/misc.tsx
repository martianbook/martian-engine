import { TextNode as TextNodeType } from '../lib/schema'

// ── TextNode ─────────────────────────────────────────────────────────────

interface TextNodeProps {
  node: TextNodeType
}

export function TextNode({ node }: TextNodeProps) {
  return (
    <div className={`text-node text-node--${node.source}`} data-text-id={node.id}>
      <div className="text-node-content">
        {node.content}
      </div>
      {node.original_content !== null && (
        <span className="text-node-edited">edited</span>
      )}
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────────

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◈</div>
      <div className="empty-title">No mission data</div>
      {message && <div className="empty-msg">{message}</div>}
      <div className="empty-hint">
        Run <code>martian main.py</code> to generate a report
      </div>
    </div>
  )
}