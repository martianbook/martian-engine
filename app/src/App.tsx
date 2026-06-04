import { useState, useEffect } from 'react'
import { parseReport, MartianReport } from './lib/schema'
import Header from './components/Header'
import MissionBar from './components/MissionBar'
import CellList from './components/CellList'
import { EmptyState } from './components/misc'
import './styles/tokens.css'
import './styles/base.css'
import './styles/highlight.css'

declare global {
  interface Window {
    __MARTIAN_REPORT__?: unknown
  }
}

function App() {
  const [report, setReport] = useState<MartianReport | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [theme, setTheme]   = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('martian-theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('martian-theme', theme)
  }, [theme])

  useEffect(() => {
    if (window.__MARTIAN_REPORT__) {
      try {
        setReport(parseReport(window.__MARTIAN_REPORT__))
      } catch (e) {
        setError(`Failed to parse report: ${e instanceof Error ? e.message : String(e)}`)
      }
      return
    }

    fetch('/report.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(raw => setReport(parseReport(raw)))
      .catch(e => setError(String(e.message)))
  }, [])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (error) {
    return <div className="app"><EmptyState message={error} /></div>
  }

  if (!report) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header report={report} theme={theme} onToggleTheme={toggleTheme} />
      <main className="main">
        <MissionBar report={report} />
        <CellList report={report} />
      </main>
    </div>
  )
}

export default App