import { MartianReport } from '../lib/schema'

interface Props {
  report:        MartianReport
  theme:         'dark' | 'light'
  onToggleTheme: () => void
}

export default function Header({ report, theme, onToggleTheme }: Props) {
  const m = report.mission

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="logo">
            <span className="logo-mark">◈</span>
            <span className="logo-text">MartianBook</span>
          </div>
        </div>

        <div className="header-center">
          <span className="mission-tag">{m.entry_point}</span>
          <span className="mission-tag">{m.environment.language} {m.environment.language_version}</span>
          {m.environment.runtime && (
            <span className="mission-tag">{m.environment.runtime}</span>
          )}
          <span className="mission-tag">{m.duration_ms.toFixed(1)}ms</span>
          <span className={`mission-tag mission-tag--status mission-tag--${m.status}`}>
            {m.status === 'success' ? '✓' : '✗'} {m.status}
          </span>
        </div>

        <div className="header-right">
          <button className="theme-btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? '◐' : '●'}
          </button>
        </div>
      </div>
    </header>
  )
}