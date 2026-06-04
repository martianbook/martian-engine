import { useState } from 'react'
import { Artifact } from '../lib/schema'

interface Props {
  artifact: Artifact
}

const IMAGE_FORMATS = new Set(['png', 'jpg', 'jpeg', 'svg'])

export default function ArtifactBlock({ artifact }: Props) {
  const [open, setOpen] = useState(true)
  const name    = artifact.label ?? artifact.path.split('/').pop() ?? artifact.path
  const isImage = IMAGE_FORMATS.has(artifact.format.toLowerCase())
  const imgSrc = artifact.path.startsWith('data:')
    ? artifact.path                          // export mode — already base64
    : `/${artifact.path}`                    // serve mode — prepend / for HTTP route

  return (
    <div className="block block--artifact">
      <div className="block-label" onClick={() => setOpen(o => !o)}>
        <span className="block-chevron">{open ? '▾' : '▸'}</span>
        <span>artifact · {artifact.type}</span>
      </div>
      {open && (
        <div className="block-content">
          {isImage && (
            <img
              className="artifact-img"
              src={imgSrc}
              alt={name}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="artifact-meta">
            <span className="artifact-name">{name}</span>
            <span className="artifact-path">{artifact.path}</span>
          </div>
        </div>
      )}
    </div>
  )
}