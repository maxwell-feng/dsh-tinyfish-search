import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import yaml from 'js-yaml'

const patchPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'cordis.patch.yml')
// Normalize line endings: git may have checked the working copy out with CRLF.
const patchText = readFileSync(patchPath, 'utf8').replace(/\r\n/g, '\n')
// Parsed, not regex-scraped: assertions address real row objects, so an
// indentation slip fails loudly here instead of silently passing upstream.
const patch = yaml.load(patchText)

/** The `insert` list of this bundle patch (its first entry; the remaining top-level rows override base rows by id). */
function insertRows() {
  const insertEntry = patch.find((entry) => entry.insert !== undefined)
  assert.ok(insertEntry, 'patch must carry an insert entry')
  const rows = insertEntry.insert
  assert.ok(Array.isArray(rows) && rows.length === 1, 'patch must insert the plugin row')
  return rows
}

/** One patch row by id (inserted rows and id-override rows alike). */
function row(id) {
  const found = patch
    .flatMap((entry) => entry.insert !== undefined ? entry.insert : [entry])
    .find((candidate) => candidate.id === id)
  assert.ok(found, `patch must carry a "${id}" row`)
  return found
}

/**
 * Apply loader id-patch semantics (vendor/cordis-plugin-include
 * applyEntryPatches: per-key assignment, `config` replaced wholesale) the way
 * a later layer composes over dsh-base, then return the composed row.
 */
function composeOverBase(baseRow, override) {
  const composed = structuredClone(baseRow)
  for (const [key, value] of Object.entries(override)) {
    if (key === 'id') continue
    composed[key] = value
  }
  return composed
}

test('bundle patch inserts the plugin row and routes the web seam to tinyfish', () => {
  // The exact regression this guards: dsh-base pins `searchProvider:
  // deepseek-official` on the `web` row, so a provider that only registers
  // itself is never selected — the built-in web_search keeps failing against
  // the DeepSeek backend ("DeepSeek API error (HTTP 404)" with a
  // non-DeepSeek key). The bundle patch must override that row by id and
  // restate every config key the row needs (config is replaced wholesale,
  // never deep-merged; see docs: user/develop/basic/publish.md, "The loading
  // order").
  const webOverride = row('web')
  assert.equal(webOverride.config.searchProvider, 'tinyfish', 'search provider must be routed to tinyfish')
  assert.equal(webOverride.config.fetchProvider, 'http', 'fetchProvider must be restated (wholesale replace)')

  // Compose over the real dsh-base row and assert no base key is lost.
  const baseWebRow = { id: 'web', name: '@deepseek-ai/dsh-web', config: { searchProvider: 'deepseek-official', fetchProvider: 'http' } }
  const composedWeb = composeOverBase(baseWebRow, webOverride)
  assert.equal(composedWeb.config.searchProvider, 'tinyfish')
  assert.equal(composedWeb.config.fetchProvider, 'http')
  assert.ok(!JSON.stringify(composedWeb.config).includes('deepseek-official'), 'the pinned DeepSeek provider must be overridden')

  // The plugin row must be inserted with its package name (the loader resolves
  // the installed package by name).
  assert.equal(row('dsh-tinyfish-search').name, 'dsh-tinyfish-search')
})

test('tool-web row clears the web-app disable and restates every dsh-base config key', () => {
  // The exact regressions this guards:
  // 1. The `@deepseek-ai/dsh-web-app` bundle ships `tool-web` disabled; a
  //    config-only row would leave `disabled: true` in place (the merge is
  //    per-key), so `web_search` would never register (fixed in 0.2.1).
  // 2. dsh-base's row carries `fetch: true` and `searchTimeoutMs: 60000`;
  //    because `config` is replaced wholesale, a row that drops them would
  //    silently fall back to schema defaults (30s search budget).
  const override = row('tool-web')
  assert.equal(override.disabled, false, '`disabled: false` is REQUIRED to clear the web-app disable')
  assert.equal(override.config.search, true)
  assert.equal(override.config.fetch, true)
  assert.equal(override.config.searchTimeoutMs, 60000)
  assert.equal(override.config.fetchTimeoutMs, 30000)

  // Compose over the real dsh-base row: every base key must survive.
  const baseToolWebRow = { id: 'tool-web', name: '@deepseek-ai/dsh-tool-web', config: { fetch: true, searchTimeoutMs: 60000 } }
  const composed = composeOverBase(baseToolWebRow, override)
  assert.equal(composed.disabled, false)
  assert.equal(composed.config.fetch, true)
  assert.equal(composed.config.searchTimeoutMs, 60000)
  // `search: true` matches the dsh-tool-web schema default; restating it here
  // documents the enablement intent the row re-asserts against the web app.
  assert.equal(composed.config.search, true)
})

test('plugin row carries the documented config scaffolding (all fields commented)', () => {
  // README "Configure": every field optional and commented out, so the shipped
  // patch commits no literal key while showing where one goes. A comment-only
  // `config:` mapping parses as `null`, which the plugin's schemastery schema
  // resolves to its defaults (verified), so both null and {} are acceptable.
  const pluginRow = row('dsh-tinyfish-search')
  assert.ok(pluginRow.config === null || pluginRow.config === undefined || Object.keys(pluginRow.config).length === 0,
    'shipped config must carry no literal values')
  assert.match(patchText, /# apiKey: "literal-key"/, 'documented apiKey option must be shown')
  assert.match(patchText, /# apiKeyEnv: TINYFISH_API_KEY/, 'documented apiKeyEnv option must be shown')
  assert.match(patchText, /# baseURL: https:\/\/api\.search\.tinyfish\.ai/, 'documented baseURL option must be shown')
  assert.match(patchText, /# location: US/, 'documented location option must be shown')
  assert.match(patchText, /# language: en/, 'documented language option must be shown')
})
