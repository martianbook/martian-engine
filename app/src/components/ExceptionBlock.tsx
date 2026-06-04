import { ExceptionRecord } from '../lib/schema'

interface Props {
  exception: ExceptionRecord
}

export default function ExceptionBlock({ exception }: Props) {
  return (
    <div className="block block--exception">
      <div className="block-label block-label--plain">
        <span style={{ visibility: 'hidden' }}>▸</span>
        <span>exception</span>
      </div>
      <div className="block-content">
        <div className="exc-type">
          {exception.type_name}: {exception.message}
        </div>
        <pre className="exc-traceback">{exception.traceback}</pre>
      </div>
    </div>
  )
}