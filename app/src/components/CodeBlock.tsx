import { useState } from 'react'
import { highlightPython } from '../lib/highlight'

interface Props {
  source: string
}

export default function CodeBlock({ source }: Props) {
  const [open, setOpen] = useState(true)
  const lines = highlightPython(source)

  return (
    <div className="block block--code">
      <div className="block-label" onClick={() => setOpen(o => !o)}>
        <span className="block-chevron">{open ? '▾' : '▸'}</span>
        <span>source</span>
      </div>
      {open && (
        <div className="block-content">
          <pre className="code-pre">
            <code>
              {lines.map((line, i) => (
                <span
                  key={i}
                  className="code-line"
                  dangerouslySetInnerHTML={{ __html: line || ' ' }}
                />
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}