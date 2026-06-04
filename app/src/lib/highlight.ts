/**
 * highlight.ts — client-side Python syntax highlighting
 * Mirrors token categories from martianbook's highlight.py.
 */

interface Token {
  cls: string | null
  text: string
}

interface Pattern {
  cls: string
  re: RegExp
}

const PATTERNS: Pattern[] = [
  { cls: 'hl-decorator', re: /^(@[\w.]+)/ },
  { cls: 'hl-doc',       re: /^("""[\s\S]*?"""|'''[\s\S]*?''')/ },
  { cls: 'hl-comment',   re: /^(#.*)/ },
  { cls: 'hl-str',       re: /^(f"""[\s\S]*?"""|f'''[\s\S]*?'''|f"(?:[^"\\]|\\.)*"|f'(?:[^'\\]|\\.)*')/ },
  { cls: 'hl-str',       re: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
  { cls: 'hl-kw',        re: /^(def|class|return|import|from|as|if|elif|else|for|while|in|not|and|or|is|with|try|except|finally|raise|pass|break|continue|lambda|yield|async|await|global|nonlocal|del|assert)\b/ },
  { cls: 'hl-builtin',   re: /^(print|len|range|type|str|int|float|bool|list|dict|set|tuple|isinstance|hasattr|getattr|setattr|super|property|staticmethod|classmethod|open|zip|map|filter|enumerate|sorted|reversed|any|all|min|max|sum|abs|round|repr|id|hash|iter|next)\b/ },
  { cls: 'hl-exception', re: /^(Exception|ValueError|TypeError|KeyError|IndexError|AttributeError|RuntimeError|StopIteration|OSError|FileNotFoundError|ImportError|NotImplementedError|OverflowError|ZeroDivisionError)\b/ },
  { cls: 'hl-num',       re: /^(0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?)/ },
  { cls: 'hl-op',        re: /^(->|:=|==|!=|<=|>=|<<|>>|\*\*|\/\/|[+\-*/%&|^~<>=!])/ },
  { cls: 'hl-punct',     re: /^([(){}\[\],.:;])/ },
  { cls: 'hl-magic',     re: /^(__\w+__)/ },
  { cls: 'hl-var',       re: /^([a-zA-Z_]\w*)/ },
]

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let pos = 0

  while (pos < line.length) {
    const slice = line.slice(pos)
    let matched = false

    for (const { cls, re } of PATTERNS) {
      const m = slice.match(re)
      if (m) {
        tokens.push({ cls, text: m[1] })
        pos += m[1].length
        matched = true
        break
      }
    }

    if (!matched) {
      tokens.push({ cls: null, text: slice[0] })
      pos++
    }
  }

  return tokens
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function highlightPython(source: string): string[] {
  return source.split('\n').map(line => {
    const tokens = tokenizeLine(line)
    return tokens
      .map(({ cls, text }) => {
        const escaped = escapeHtml(text)
        return cls ? `<span class="${cls}">${escaped}</span>` : escaped
      })
      .join('')
  })
}