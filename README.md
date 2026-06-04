# martian-engine

**The schema and renderer for MartianBook — language-agnostic.**

`martian-engine` is the canonical definition of what a MartianBook *is* and how it renders. Every language adapter (Python, Rust, TypeScript, C++, ...) produces a `report.json` conforming to the schema defined here. `martian-engine` consumes that file and renders a MartianBook.

---

## Why this exists

The original renderer lived inside the Python `martianbook` package. That meant: to render a Rust execution report, you needed Python installed. That's wrong.

`martian-engine` fixes this:

```
python script  ─┐
rust binary    ─┼──► report.json ──► martian-engine ──► MartianBook
typescript app ─┘
```

The engine is the single source of truth for both the schema and the rendering. Adapters in any language just need to emit a valid `report.json`.

---

## Structure

```
martian-engine/
├── schema/
│   └── report.schema.json     ← JSON Schema (source of truth)
├── app/                       ← React + Vite + TypeScript renderer
│   ├── bin/
│   │   └── martian-engine.js  ← CLI entry point
│   ├── src/
│   │   ├── lib/
│   │   │   ├── schema.ts      ← IR types + query helpers
│   │   │   └── highlight.ts   ← client-side Python syntax highlighting
│   │   ├── components/        ← React components
│   │   └── styles/            ← CSS design tokens + base styles
│   └── public/
│       └── report.json        ← drop your report here for dev
└── README.md
```

---

## Installation

Build once, run anywhere:

```bash
cd app
pnpm install
pnpm build
npm install -g .   # installs the `mars` command globally
```

---

## Usage

```bash
mars serve              # finds .martian/report.json in current directory
mars serve path/to/report.json
mars serve --port=8080

mars export             # exports martianbook.html in current directory
mars export -o out.html
```

---

## Development

```bash
cd app
pnpm dev        # → http://localhost:5173
# drop a report.json into app/public/ to load data
```

---

## Building

```bash
cd app
pnpm build      # → app/dist/
pnpm typecheck  # run tsc --noEmit
```

---

## Schema

The Martian IR is defined in `schema/report.schema.json` and mirrored as TypeScript types in `app/src/lib/schema.ts`.

Key fields:

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
