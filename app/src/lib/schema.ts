/**
 * martian-engine — schema.ts
 * Canonical Martian IR types + report query helpers.
 * All adapters (Python, Rust, TS, ...) must produce report.json conforming to these types.
 *
 * @version 0.3.0
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type Status = 'success' | 'failed' | 'skipped' | 'running'

export type ArtifactType = 'plot' | 'image' | 'svg' | 'csv' | 'json' | 'text' | 'file'

export type TextNodeSource = 'decorator' | 'user'

// ── Environment ────────────────────────────────────────────────────────────

export interface Environment {
  language:         string
  language_version: string
  platform:         string
  runtime:          string | null
  packages:         Record<string, string>
}

// ── Mission ────────────────────────────────────────────────────────────────

export interface Mission {
  id:              string
  entry_point:     string
  adapter:         string
  adapter_version: string
  status:          Status
  started_at:      string   // ISO 8601
  duration_ms:     number
  environment:     Environment
}

// ── Return summary ─────────────────────────────────────────────────────────

export interface ReturnSummary {
  type_name:  string
  shape:      number[] | null
  length:     number | null
  preview:    string | null
  serialized: boolean
}

// ── Execution node ─────────────────────────────────────────────────────────

export interface ExecutionNode {
  id:           string
  name:         string
  module:       string
  file:         string
  line_start:   number
  call_order:   number
  depth:        number
  duration_ms:  number
  status:       Status
  text:         string | null
  source_code:  string | null
  args:         Record<string, string>
  stdout:       string[]
  stderr:       string[]
  ret:          ReturnSummary | null
  parent:       string | null
  children:     string[]
  artifact_ids: string[]
  exception_id: string | null
  section:      string | null
}

// ── Artifact ───────────────────────────────────────────────────────────────

export interface Artifact {
  id:           string
  type:         ArtifactType
  format:       string
  path:         string
  produced_by:  string
  timestamp_ms: number
  label:        string | null
}

// ── Exception ──────────────────────────────────────────────────────────────

export interface ExceptionRecord {
  id:           string
  function_id:  string
  type_name:    string
  message:      string
  traceback:    string
  timestamp_ms: number
  handled:      boolean
}

// ── Section ────────────────────────────────────────────────────────────────

export interface Section {
  id:           string
  label:        string
  function_ids: string[]
}

// ── TextNode ───────────────────────────────────────────────────────────────

export interface TextNode {
  id:               string
  content:          string
  source:           TextNodeSource
  anchor_id:        string | null
  anchor_index:     number
  section:          string | null
  original_content: string | null
  created_at:       string
  edited_at:        string | null
}

// ── MartianReport (root) ───────────────────────────────────────────────────

export interface MartianReport {
  martian_version: string
  mission:         Mission
  execution:       ExecutionNode[]
  artifacts:       Artifact[]
  exceptions:      ExceptionRecord[]
  sections:        Section[]
  text_nodes:      TextNode[]
  dependencies:    Record<string, string[]>
}

// ── Parser ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseReport(raw: any): MartianReport {
  return {
    martian_version: raw.martian_version ?? '0.0.0',
    mission:         parseMission(raw.mission),
    execution:       (raw.execution ?? []).map(parseNode),
    artifacts:       (raw.artifacts ?? []).map(parseArtifact),
    exceptions:      (raw.exceptions ?? []).map(parseException),
    sections:        (raw.sections ?? []).map(parseSection),
    text_nodes:      (raw.text_nodes ?? []).map(parseTextNode),
    dependencies:    raw.dependencies ?? {},
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMission(m: any): Mission {
  return {
    id:              m.id,
    entry_point:     m.entry_point,
    adapter:         m.adapter,
    adapter_version: m.adapter_version,
    status:          m.status,
    started_at:      m.started_at,
    duration_ms:     m.duration_ms,
    environment: {
      language:         m.environment.language,
      language_version: m.environment.language_version,
      platform:         m.environment.platform,
      runtime:          m.environment.runtime ?? null,
      packages:         m.environment.packages ?? {},
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNode(n: any): ExecutionNode {
  return {
    id:           n.id,
    name:         n.name,
    module:       n.module,
    file:         n.file,
    line_start:   n.line_start,
    call_order:   n.call_order,
    depth:        n.depth,
    duration_ms:  n.duration_ms,
    status:       n.status,
    text:         n.text ?? null,
    source_code:  n.source_code ?? null,
    args:         n.args ?? {},
    stdout:       n.stdout ?? [],
    stderr:       n.stderr ?? [],
    ret:          n.ret ?? null,
    parent:       n.parent ?? null,
    children:     n.children ?? [],
    artifact_ids: n.artifact_ids ?? [],
    exception_id: n.exception_id ?? null,
    section:      n.section ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseArtifact(a: any): Artifact {
  return {
    id:           a.id,
    type:         a.type,
    format:       a.format,
    path:         a.path,
    produced_by:  a.produced_by,
    timestamp_ms: a.timestamp_ms,
    label:        a.label ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseException(e: any): ExceptionRecord {
  return {
    id:           e.id,
    function_id:  e.function_id,
    type_name:    e.type_name,
    message:      e.message,
    traceback:    e.traceback,
    timestamp_ms: e.timestamp_ms,
    handled:      e.handled ?? false,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSection(s: any): Section {
  return {
    id:           s.id,
    label:        s.label,
    function_ids: s.function_ids ?? [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTextNode(t: any): TextNode {
  return {
    id:               t.id,
    content:          t.content,
    source:           t.source,
    anchor_id:        t.anchor_id ?? null,
    anchor_index:     t.anchor_index ?? 0,
    section:          t.section ?? null,
    original_content: t.original_content ?? null,
    created_at:       t.created_at ?? '',
    edited_at:        t.edited_at ?? null,
  }
}

// ── Query helpers ──────────────────────────────────────────────────────────

export function getNode(report: MartianReport, id: string): ExecutionNode | null {
  return report.execution.find(n => n.id === id) ?? null
}

export function getArtifact(report: MartianReport, id: string): Artifact | null {
  return report.artifacts.find(a => a.id === id) ?? null
}

export function getException(report: MartianReport, id: string): ExceptionRecord | null {
  return report.exceptions.find(e => e.id === id) ?? null
}

export function getTextNodesFor(report: MartianReport, functionId: string): TextNode[] {
  return report.text_nodes
    .filter(t => t.anchor_id === functionId)
    .sort((a, b) => a.anchor_index - b.anchor_index)
}

export function topLevelNodes(report: MartianReport): ExecutionNode[] {
  return report.execution
    .filter(n => n.parent === null)
    .sort((a, b) => a.call_order - b.call_order)
}

export function childrenOf(report: MartianReport, functionId: string): ExecutionNode[] {
  return report.execution
    .filter(n => n.parent === functionId)
    .sort((a, b) => a.call_order - b.call_order)
}