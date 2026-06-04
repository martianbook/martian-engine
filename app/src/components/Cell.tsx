import { useState, useEffect } from 'react'
import {
  MartianReport, ExecutionNode,
  getArtifact, getException, getTextNodesFor,
} from '../lib/schema'
import { TextNode } from './misc'
import CodeBlock from './CodeBlock'
import OutputBlock from './OutputBlock'
import ArtifactBlock from './ArtifactBlock'
import ExceptionBlock from './ExceptionBlock'

interface Props {
  report:         MartianReport
  node:           ExecutionNode
  forceCollapsed: boolean
}

export default function Cell({ report, node, forceCollapsed }: Props) {
  const hasOutput    = node.stdout.length > 0 || node.stderr.length > 0
                    || node.ret !== null || Object.keys(node.args).length > 0
  const hasArtifacts = node.artifact_ids.length > 0
  const hasException = node.exception_id !== null

  const autoCollapse = !hasOutput && !hasArtifacts && !hasException
  const [collapsed, setCollapsed] = useState(autoCollapse)

  useEffect(() => {
    setCollapsed(forceCollapsed)
  }, [forceCollapsed])

  const textNodes = getTextNodesFor(report, node.id)
  const exception = hasException ? getException(report, node.exception_id!) : null
  const artifacts = node.artifact_ids.map(id => getArtifact(report, id)).filter(Boolean)

  const depthPx  = node.depth * 28
  const isSuccess = node.status === 'success'

  return (
    <>
      {textNodes.map(tn => (
        <TextNode key={tn.id} node={tn} />
      ))}

      <div
        className={`cell cell--${node.status} ${collapsed ? 'cell--collapsed' : ''}`}
        style={{ marginLeft: `${depthPx}px` }}
        data-id={node.id}
      >
        <div className="cell-header" onClick={() => setCollapsed(c => !c)}>
          <span className={`cell-status ${isSuccess ? 'cell-status--ok' : 'cell-status--fail'}`}>
            {isSuccess ? '✓' : '✗'}
          </span>

          <span className="cell-name">{node.name}</span>
          <span className="cell-loc">{node.module}:{node.line_start}</span>

          {node.section && (
            <span className="badge badge--section">{node.section}</span>
          )}
          {node.children.length > 0 && (
            <span className="badge badge--children">
              {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
            </span>
          )}

          <span className="cell-timing">{node.duration_ms.toFixed(1)}ms</span>
          <span className="cell-chevron">{collapsed ? '›' : '⌄'}</span>
        </div>

        {!collapsed && (
          <div className="cell-body">
            {node.text && (
              <div className="block block--prose">
                <p className="prose-text">{node.text}</p>
              </div>
            )}

            {node.source_code && (
              <CodeBlock source={node.source_code} />
            )}

            {hasOutput && (
              <OutputBlock node={node} />
            )}

            {artifacts.map(art => art && (
              <ArtifactBlock key={art.id} artifact={art} />
            ))}

            {exception && (
              <ExceptionBlock exception={exception} />
            )}
          </div>
        )}
      </div>
    </>
  )
}