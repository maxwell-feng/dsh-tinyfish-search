import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const patchPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'cordis.patch.yml')
// Normalize line endings: git may have checked the working copy out with CRLF.
const patch = readFileSync(patchPath, 'utf8').replace(/\r\n/g, '\n')

test('bundle patch inserts the plugin row and routes the web seam to tinyfish', () => {
  // The exact regression this guards: dsh-base pins `searchProvider:
  // deepseek-official` on the `web` row, so a provider that only registers
  // itself is never selected — the built-in web_search keeps failing against
  // the DeepSeek backend ("DeepSeek API error (HTTP 404)" with a
  // non-DeepSeek key). The bundle patch must override that row by id and
  // restate every config key the row needs (config is replaced wholesale,
  // never deep-merged; see docs: user/develop/basic/publish.md, "The loading
  // order").
  // Match the whole `web` row body: the id line plus every indented
  // continuation line (config values are 4-space indented, other keys could
  // be 2-space; a `\n- id:` ends the block because `-` is not indented).
  const webBlock = patch.match(/- id: web\n((?: {2}.*(?:\n|$)|\n)*)/)
  assert.ok(webBlock, 'patch must carry a `web` row override')
  assert.match(webBlock[1], /searchProvider: tinyfish/, 'search provider must be routed to tinyfish')
  assert.match(webBlock[1], /fetchProvider: http/, 'fetchProvider must be restated (wholesale replace)')
  assert.doesNotMatch(webBlock[1], /deepseek-official/, 'the pinned DeepSeek provider must be overridden')

  // The plugin row must still be inserted.
  assert.match(patch, /- id: dsh-tinyfish-search\n\s+name: dsh-tinyfish-search/)
})