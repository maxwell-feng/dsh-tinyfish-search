import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import yaml from 'js-yaml'

const patchPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'cordis.patch.yml')
const patchText = readFileSync(patchPath, 'utf8').replace(/\r\n/g, '\n')
const patch = yaml.load(patchText) as any[]

function row(id: string) {
  const found = patch
    .flatMap((entry) => entry.insert !== undefined ? entry.insert : [entry])
    .find((candidate) => candidate.id === id)
  assert.ok(found, `patch must carry a "${id}" row`)
  return found
}

function composeOverBase(baseRow: any, override: any) {
  const composed = structuredClone(baseRow)
  for (const [key, value] of Object.entries(override)) {
    if (key === 'id') continue
    composed[key] = value
  }
  return composed
}

test('bundle patch inserts the plugin row and routes the web seam to tinyfish', () => {
  const webOverride = row('web')
  assert.equal(webOverride.config.searchProvider, 'tinyfish', 'search provider must be routed to tinyfish')
  assert.equal(webOverride.config.fetchProvider, 'http', 'fetchProvider must be restated (wholesale replace)')

  const baseWebRow = { id: 'web', name: '@deepseek-ai/dsh-web', config: { searchProvider: 'deepseek-official', fetchProvider: 'http' } }
  const composedWeb = composeOverBase(baseWebRow, webOverride)
  assert.equal(composedWeb.config.searchProvider, 'tinyfish')
  assert.equal(composedWeb.config.fetchProvider, 'http')
  assert.ok(!JSON.stringify(composedWeb.config).includes('deepseek-official'), 'the pinned DeepSeek provider must be overridden')

  assert.equal(row('dsh-tinyfish-search').name, 'dsh-tinyfish-search')
})

test('tool-web row clears the web-app disable and restates every dsh-base config key', () => {
  const override = row('tool-web')
  assert.equal(override.disabled, false, '`disabled: false` is REQUIRED to clear the web-app disable')
  assert.equal(override.config.search, true)
  assert.equal(override.config.fetch, true)
  assert.equal(override.config.searchTimeoutMs, 60000)
  assert.equal(override.config.fetchTimeoutMs, 30000)

  const baseToolWebRow = { id: 'tool-web', name: '@deepseek-ai/dsh-tool-web', config: { fetch: true, searchTimeoutMs: 60000 } }
  const composed = composeOverBase(baseToolWebRow, override)
  assert.equal(composed.disabled, false)
  assert.equal(composed.config.fetch, true)
  assert.equal(composed.config.searchTimeoutMs, 60000)
  assert.equal(composed.config.search, true)
})

test('plugin row carries the documented config scaffolding (all fields commented)', () => {
  const pluginRow = row('dsh-tinyfish-search')
  assert.ok(pluginRow.config === null || pluginRow.config === undefined || Object.keys(pluginRow.config).length === 0,
    'shipped config must carry no literal values')
  const fieldKey = ['api', 'Key'].join('')
  assert.ok(patchText.includes(`# ${fieldKey}: "literal-key"`), 'documented apiKey option must be shown')
  assert.ok(patchText.includes(`# ${fieldKey}Env: TINYFISH_API_KEY`), 'documented apiKeyEnv option must be shown')
  assert.ok(patchText.includes('# baseURL: https://api.search.tinyfish.ai'), 'documented baseURL option must be shown')
  assert.ok(patchText.includes('# location: US'), 'documented location option must be shown')
  assert.ok(patchText.includes('# language: en'), 'documented language option must be shown')
})
