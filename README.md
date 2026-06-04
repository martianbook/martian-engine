# martian-engine

**Language-agnostic schema and renderer for MartianBook.**

Any language adapter — Python, Rust, TypeScript, C++ — produces a `report.json`. `martian-engine` turns it into a MartianBook. No Python required.

```
python script  ─┐
rust binary    ─┼──► .martian/report.json ──► mars serve ──► MartianBook
typescript app ─┘
```

---

## Installation

Requires Node.js ≥ 18.

```bash
git clone https://github.com/martianbook/martian-engine
cd martian-engine/app
pnpm install
pnpm build
npm install -g .
```

Verify:

```bash
mars
```

To update after pulling new changes:

```bash
pnpm build
npm install -g .
```

---

## Usage

Run from any project directory that has a `.martian/report.json`:

```bash
# Serve live in browser
mars serve

# Serve a specific report
mars serve path/to/report.json

# Serve on a custom port
mars serve --port=8080

# Export a standalone HTML file
mars export

# Export to a specific path
mars export -o report.html
```

`mars serve` re-reads `report.json` on every browser refresh — so you can run your adapter, refresh, and see the new book instantly without restarting.

`mars export` produces a fully self-contained HTML file with all assets and artifact images inlined as base64. Zero external dependencies. Works offline. Safe to email or attach to a PR.

---

## Quick start with Python

```bash
pip install martianbook

# Instrument your code
import martianbook as martian

@martian.capture
def load_data(path: str):
    """Loads raw CSV data."""
    ...

# Run
martian main.py

# View
mars serve
```

---

## Quick start with Rust

```bash
cargo run

# View
mars serve
```

See `martianbook/martian-rust` for the Rust adapter.

---

## Development

```bash
cd app
pnpm dev        # → http://localhost:5173
```

Drop a `report.json` into `app/public/` to load data in dev mode.

```bash
pnpm build      # production build → app/dist/
pnpm typecheck  # tsc --noEmit
```

---

## Structure

```
martian-engine/
├── schema/
│   └── report.schema.json     ← JSON Schema (canonical contract)
└── app/
    ├── bin/
    │   └── martian-engine.js  ← mars CLI
    ├── src/
    │   ├── lib/
    │   │   ├── schema.ts      ← IR types + query helpers
    │   │   └── highlight.ts   ← syntax highlighting
    │   ├── components/        ← React components
    │   └── styles/            ← CSS tokens + base styles
    └── public/
        └── report.json        ← dev data (gitignored)
```

---

## Schema

The Martian IR is defined in `schema/report.schema.json` and mirrored as TypeScript interfaces in `app/src/lib/schema.ts`. Adapters in any language must emit a `report.json` conforming to this schema.

```json
{
  "martian_version": "0.3.0",
  "mission": { ... },
  "execution": [ ExecutionNode, ... ],
  "artifacts": [ Artifact, ... ],
  "exceptions": [ ExceptionRecord, ... ],
  "sections": [ Section, ... ],
  "text_nodes": [ TextNode, ... ],
  "dependencies": { "fn_id": ["child_fn_id", ...] }
}
```

See `schema/report.schema.json` for the full spec.

---

## Adapters

| Language   | Repo                        | Status          |
|------------|-----------------------------|-----------------|
| Python     | `martianbook/martianbook`   | ✅ stable       |
| Rust       | `martianbook/martian-rust`  | 🚧 in progress  |
| TypeScript | `martianbook/martian-ts`    | planned         |

---

## License

MIT
