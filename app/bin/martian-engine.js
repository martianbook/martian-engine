#!/usr/bin/env node

import { createServer } from 'http'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST      = resolve(__dirname, '../dist')

const args    = process.argv.slice(2)
const command = args[0]

function findReport(maybeArg) {
  const candidates = [maybeArg, '.martian/report.json', 'report.json'].filter(Boolean)
  for (const c of candidates) {
    const p = resolve(process.cwd(), c)
    if (existsSync(p)) return p
  }
  console.error('\n  ✗ No report.json found.')
  console.error('    Run your martian adapter first (e.g. martian main.py)\n')
  process.exit(1)
}

function loadReport(reportPath) {
  try {
    return JSON.parse(readFileSync(reportPath, 'utf-8'))
  } catch (e) {
    console.error(`\n  ✗ Could not read report: ${reportPath}\n  ${e.message}\n`)
    process.exit(1)
  }
}

function normalizeArtifactPaths(report) {
  const cwd = process.cwd()
  report.artifacts = (report.artifacts ?? []).map(art => ({
    ...art,
    path: art.path.startsWith('/') && art.path.startsWith(cwd)
      ? art.path.slice(cwd.length + 1)
      : art.path
  }))
  return report
}

const IMAGE_FORMATS = new Set(['png', 'jpg', 'jpeg', 'svg'])
const MIME = {
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  svg:  'image/svg+xml',
}

function inlineArtifacts(report) {
  report.artifacts = report.artifacts.map(art => {
    if (!IMAGE_FORMATS.has(art.format.toLowerCase())) return art
    const absPath = resolve(process.cwd(), art.path)
    if (!existsSync(absPath)) return art
    try {
      const data = readFileSync(absPath)
      const mime = MIME[art.format.toLowerCase()]
      return { ...art, path: `data:${mime};base64,${data.toString('base64')}` }
    } catch {
      return art
    }
  })
  return report
}

// ── serve ──────────────────────────────────────────────────────────────────

function serve(reportArg, port = 7420) {
  const reportPath = findReport(reportArg)
  const indexHtml  = readFileSync(resolve(DIST, 'index.html'), 'utf-8')

  const server = createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(indexHtml)

    } else if (req.url === '/report.json') {
    const fresh = JSON.parse(readFileSync(reportPath, 'utf-8'))
    normalizeArtifactPaths(fresh)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(fresh))
    } else if (req.url.startsWith('/assets/')) {
      const assetPath = resolve(DIST, req.url.slice(1))
      try {
        const content = readFileSync(assetPath)
        const ct = req.url.endsWith('.js') ? 'application/javascript'
                 : req.url.endsWith('.css') ? 'text/css'
                 : 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': ct })
        res.end(content)
      } catch {
        res.writeHead(404); res.end()
      }

    } else if (req.url.startsWith('/.martian/artifacts/') || req.url.startsWith('/artifacts/')) {
      // Serve artifact files from CWD
      const artifactPath = resolve(process.cwd(), req.url.slice(1))
      try {
        const content = readFileSync(artifactPath)
        const ext  = extname(artifactPath).slice(1).toLowerCase()
        const mime = MIME[ext] || 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': mime })
        res.end(content)
      } catch {
        res.writeHead(404); res.end()
      }

    } else {
      res.writeHead(404); res.end()
    }
  })

  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}`
    console.log(`\n  ◈ MartianBook  ${url}`)
    console.log(`    report: ${reportPath}`)
    console.log(`    Press Ctrl+C to stop.\n`)
    const open = process.platform === 'darwin' ? 'open'
               : process.platform === 'win32'  ? 'start'
               : 'xdg-open'
    try { execSync(`${open} ${url}`) } catch {}
  })
}

// ── export ─────────────────────────────────────────────────────────────────

function exportHtml(reportArg, outPath = 'martianbook.html') {
  const reportPath = findReport(reportArg)
  const report     = loadReport(reportPath)
  normalizeArtifactPaths(report)
  const inlined    = inlineArtifacts(structuredClone(report))

  let html = readFileSync(resolve(DIST, 'index.html'), 'utf-8')

  html = html.replace(
    /<script type="module" crossorigin src="(\/assets\/[^"]+)"><\/script>/,
    (_, src) => {
      const js = readFileSync(resolve(DIST, src.slice(1)), 'utf-8')
      return `<script type="module">\n${js}\n</script>`
    }
  )
  html = html.replace(
    /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+)">/,
    (_, href) => {
      const css = readFileSync(resolve(DIST, href.slice(1)), 'utf-8')
      return `<style>\n${css}\n</style>`
    }
  )

  const injection = `<script>window.__MARTIAN_REPORT__ = ${JSON.stringify(inlined)};</script>`
  html = html.replace('<!-- __MARTIAN_REPORT_INJECTION__ -->', injection)

  const title = report.mission?.entry_point ?? 'MartianBook'
  html = html.replace('<!-- __MARTIAN_TITLE__ -->', `<title>MartianBook — ${title}</title>`)

  const out = resolve(process.cwd(), outPath)
  writeFileSync(out, html, 'utf-8')

  const kb = (readFileSync(out).length / 1024).toFixed(1)
  console.log(`\n  ◈ Exported: ${out}  (${kb} KB)\n`)
}

// ── dispatch ───────────────────────────────────────────────────────────────

switch (command) {
  case 'serve': {
    const reportArg = args[1]?.endsWith('.json') ? args[1] : undefined
    const port      = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] ?? '7420')
    serve(reportArg, port)
    break
  }
  case 'export': {
    const reportArg = args[1]?.endsWith('.json') ? args[1] : undefined
    const oFlag     = args.indexOf('-o')
    const outPath   = oFlag !== -1 ? args[oFlag + 1] : 'martianbook.html'
    exportHtml(reportArg, outPath)
    break
  }
  default:
    console.log(`
  martian-engine — MartianBook renderer

  Usage:
    mars serve              serve .martian/report.json
    mars serve report.json  serve a specific report
    mars export             export martianbook.html
    mars export -o out.html export to specific path
    mars serve --port=8080  serve on custom port
`)
}