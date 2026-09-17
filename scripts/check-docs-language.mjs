#!/usr/bin/env node
/**
 * check-docs-language.mjs — one language per file, enforced.
 *
 * Bilingual documentation rule — one language per file, always in pairs:
 *   X.md         English only: no CJK anywhere, code fences included.
 *   X.zh.md      Chinese only: no English sentences (code, links, quoted literals
 *                and product names are exempt; fenced blocks are ignored).
 *   src/**\/*.ts English only: no CJK in strings or comments, unless the file is
 *                listed in SRC_CJK_ALLOW below.
 *   Every doc pair exists, and both sides carry a single-language switcher line
 *   (documents under .github/ are exempt from the switcher only).
 *   New or changed documents are submitted as a pair; never one side alone.
 *   Forbidden: bilingual labels, bilingual entries on one line, Chinese terms or
 *   product-name glosses in English prose (and the reverse).
 *
 * Run: node scripts/check-docs-language.mjs
 * Exits 1 with `file:line` findings when a rule is broken.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

/**
 * Per-file declarations.
 *   language: 'en' | 'zh' — declared for files whose name does not say it.
 *   pair: false            — no counterpart file is required.
 *   check: false           — exempt from the language scan (a file that must quote both languages).
 */
const FILES = {
  '.github/ISSUE_TEMPLATE/config.yml': { check: false },
}
/** Source files allowed to contain CJK, with the reason. Everything else under src/ must be English. */
const SRC_CJK_ALLOW = {}
/** Directories never scanned. */
const SKIP_DIRS = new Set(['node_modules', 'lib', 'dist', '.git', 'test', 'scripts', '.mimosa'])
/** Text files scanned as English docs unless declared otherwise. */
const SCAN_EXT = new Set(['.md', '.yml', '.yaml'])

const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/
const ENGLISH_RUN = /(?:\b[A-Za-z][A-Za-z'’-]{1,}\b[ \t]+){2,}\b[A-Za-z][A-Za-z'’-]{1,}\b/g
/** English function words: a run containing one is prose, not an identifier. */
const FUNCTION_WORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'and', 'or', 'not', 'no', 'with', 'for', 'from', 'this', 'that', 'these', 'those', 'it', 'its', 'as', 'at', 'in', 'on', 'to', 'of', 'by', 'since', 'after', 'before', 'against', 'than', 'then', 'when', 'while', 'if', 'else', 'but', 'all', 'any', 'both', 'each', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'too', 'very', 'can', 'will', 'would', 'should', 'must', 'may', 'might', 'do', 'does', 'did', 'done', 'have', 'has', 'had', 'remains', 'remain', 'required', 'verified', 'latest', 'below', 'above', 'via', 'per', 'into', 'over', 'under', 'about', 'across', 'without'])

const findings = []
const report = (file, line, message, snippet) =>
  findings.push({ file, line, message, snippet: String(snippet).trim().slice(0, 120) })

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

/** English sentence detector for Chinese documents. */
function englishSentences(line) {
  const stripped = line
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[“”][^“”]*[“”]/g, ' ')
    .replace(/"[^"]*"/g, ' ')
  const hits = []
  for (const run of stripped.match(ENGLISH_RUN) ?? []) {
    const words = run.trim().split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z'’-]/g, ''))
    if (words.length >= 5 || words.some((w) => FUNCTION_WORDS.has(w))) hits.push(run.trim())
  }
  return hits
}

const rel = (p) => relative(ROOT, p).replace(/\\/g, '/')
const files = walk(ROOT).sort()

// ---- language checks: documents ----
for (const file of files) {
  const path = rel(file)
  const decl = FILES[path] ?? {}
  if (decl.check === false) continue
  const ext = extname(file)
  if (!SCAN_EXT.has(ext) && path !== 'package.json') continue
  if (path === 'package.json') {
    const pkg = JSON.parse(readFileSync(file, 'utf8'))
    if (typeof pkg.description === 'string' && CJK.test(pkg.description)) {
      report(path, 1, 'package.json description must be English only', pkg.description)
    }
    continue
  }
  const isZh = decl.language === 'zh' || path.endsWith('.zh.md')
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  let fence = null
  lines.forEach((line, i) => {
    const isFence = /^\s*(```+|~~~+)/.test(line)
    if (isFence) fence = fence === null ? 1 : null
    if (isZh) {
      if (fence !== null || isFence) return // fenced blocks are code/literals and stay as-is
      for (const run of englishSentences(line)) report(path, i + 1, `Chinese document contains an English sentence: "${run}"`, line)
    } else if (CJK.test(line)) {
      report(path, i + 1, 'English document contains Chinese', line) // code fences included
    }
  })
}

// ---- language checks: source strings and comments ----
for (const file of files) {
  const path = rel(file)
  if (!path.startsWith('src/') || !/\.tsx?$/.test(path)) continue
  if (SRC_CJK_ALLOW[path] !== undefined) continue
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (CJK.test(line)) {
      report(path, i + 1, 'source file contains Chinese (strings and comments are English; register an exception in SRC_CJK_ALLOW otherwise)', line)
    }
  })
}

// ---- pair + switcher checks ----
for (const file of files) {
  const path = rel(file)
  if (extname(file) !== '.md' || path.endsWith('.zh.md')) continue
  const decl = FILES[path] ?? {}
  if (decl.pair === false) {
    if (!existsSync(file)) report(path, 1, 'declared file is missing', '')
    continue
  }
  const zhPath = path.replace(/\.md$/, '.zh.md')
  if (!existsSync(join(ROOT, zhPath))) {
    report(path, 1, `missing Chinese counterpart ${zhPath} (or declare the file in scripts/check-docs-language.mjs FILES)`, '')
    continue
  }
  if (path.startsWith('.github/')) continue // forms and config templates carry no switcher
  const head = (p) => readFileSync(join(ROOT, p), 'utf8').split(/\r?\n/).slice(0, 10)
  const enName = path.split('/').pop()
  const zhName = zhPath.split('/').pop()
  const enSwitcher = head(path).find((l) => /English\s*\|\s*\[Chinese\]\(/.test(l))
  const zhSwitcher = head(zhPath).find((l) => /\[英文\]\(/.test(l))
  if (!enSwitcher || !enSwitcher.includes(`(${zhName})`)) {
    report(path, 1, `switcher line missing or malformed; expected "English | [Chinese](${zhName})"`, enSwitcher ?? '')
  }
  if (!zhSwitcher || !zhSwitcher.includes(`(${enName})`)) {
    report(zhPath, 1, `switcher line missing or malformed; expected "[英文](${enName}) | 中文"`, zhSwitcher ?? '')
  }
}

// ---- result ----
if (findings.length === 0) {
  console.log('check-docs-language: OK — English docs free of Chinese, Chinese docs free of English prose, source strings English, pairs and switchers complete')
  process.exit(0)
}
console.error(`check-docs-language: ${findings.length} violation(s)\n`)
for (const f of findings) {
  console.error(`${f.file}:${f.line}  ${f.message}`)
  if (f.snippet) console.error(`    ${f.snippet}`)
}
console.error('\nRules: see the header of scripts/check-docs-language.mjs (FILES, SRC_CJK_ALLOW).')
process.exit(1)
