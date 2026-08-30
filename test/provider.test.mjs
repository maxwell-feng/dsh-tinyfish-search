import test from 'node:test'
import assert from 'node:assert/strict'
import {
  TinyFishSearchProvider,
  mapTinyFishResponse,
  TINYFISH_PROVIDER_ID,
} from '../lib/index.js'

/** Build a canned TinyFish result item. */
function item(overrides = {}) {
  return { position: 1, title: 'T', snippet: 'S', url: 'https://a.test', ...overrides }
}

/** Stub global fetch; returns the previously installed impl for restore. */
function stubFetch(impl) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  return () => { globalThis.fetch = original }
}

/** Minimal ok Response-like for the tests (only status/json are read). */
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body },
  }
}

test('registers the stable provider id "tinyfish"', () => {
  assert.equal(TINYFISH_PROVIDER_ID, 'tinyfish')
})

test('available() is a cheap local key/baseURL check, no network', () => {
  // Isolate from the ambient environment: TINYFISH_API_KEY may be set in the
  // shell that runs the tests.
  const oldKey = process.env.TINYFISH_API_KEY
  delete process.env.TINYFISH_API_KEY
  try {
    const key = 'k'.repeat(20)
    const provider = new TinyFishSearchProvider({ apiKey: key, baseURL: 'https://api.search.tinyfish.ai' })
    assert.equal(provider.available(), true)
    assert.equal(new TinyFishSearchProvider({ apiKey: key, baseURL: 'not a url' }).available(), false)
    assert.equal(new TinyFishSearchProvider({}).available(), false)
  } finally {
    if (oldKey !== undefined) process.env.TINYFISH_API_KEY = oldKey
  }
})

test('search() maps items, dedupes by url, honors maxResults, sets X-API-Key', async () => {
  const restore = stubFetch(async (url, init) => {
    assert.equal(url.searchParams.get('query'), 'hello world')
    assert.equal(url.host, 'api.search.tinyfish.ai')
    assert.equal(init.headers['x-api-key'], 'test-key')
    assert.equal(init.method, 'GET')
    return fakeResponse(200, {
      query: 'hello world',
      results: [
        item({ position: 1, title: 'A', url: 'https://a.test', snippet: 'sa', date: '2026-08-01' }),
        item({ position: 2, title: 'B', url: 'https://b.test', snippet: 'sb' }),
        item({ position: 3, title: 'dup', url: 'https://a.test' }),
      ],
    })
  })
  try {
    const result = await new TinyFishSearchProvider({
      apiKey: 'test-key',
      apiKeyEnv: 'TINYFISH_API_KEY',
      baseURL: 'https://api.search.tinyfish.ai',
    }).search({ query: 'hello world', maxResults: 5 })
    assert.deepEqual(result.sources, [
      { url: 'https://a.test', title: 'A', snippet: 'sa', publishedAt: '2026-08-01' },
      { url: 'https://b.test', title: 'B', snippet: 'sb' },
    ])
    assert.equal(result.truncated, false)
  } finally {
    restore()
  }
})

test('search() caps to maxResults at request layer', async () => {
  const restore = stubFetch(async () => fakeResponse(200, {
    results: [1, 2, 3, 4].map((n) => item({ title: `R${n}`, url: `https://r${n}.test` })),
  }))
  try {
    const result = await new TinyFishSearchProvider({ apiKey: 'k' }).search({ query: 'q', maxResults: 2 })
    assert.equal(result.sources.length, 2)
    assert.deepEqual(result.sources.map((s) => s.url), ['https://r1.test', 'https://r2.test'])
  } finally {
    restore()
  }
})

test('search() surfaces HTTP errors with the TinyFish message', async () => {
  const restore = stubFetch(async () => fakeResponse(401, {
    error: { code: 'INVALID_API_KEY', message: 'The provided API key is invalid' },
  }))
  try {
    await assert.rejects(
      new TinyFishSearchProvider({ apiKey: 'k' }).search({ query: 'q' }),
      (err) => err.code === 'WEB_PROVIDER_ERROR'
        && err.message.includes('The provided API key is invalid'),
    )
  } finally {
    restore()
  }
})

test('search() honors abort: WEB_ABORTED, never a generic HTTP error', async () => {
  const restore = stubFetch(async () => {
    throw new DOMException('aborted', 'AbortError')
  })
  try {
    const controller = new AbortController()
    controller.abort(new Error('caller cancelled'))
    await assert.rejects(
      new TinyFishSearchProvider({ apiKey: 'k' }).search({ query: 'q' }, controller.signal),
      (err) => err.code === 'WEB_ABORTED',
    )
  } finally {
    restore()
  }
})

test('search() without a key throws WEB_PROVIDER_CREDENTIAL_MISSING', async () => {
  const oldKey = process.env.TINYFISH_API_KEY
  delete process.env.TINYFISH_API_KEY
  try {
    await assert.rejects(
      new TinyFishSearchProvider({}).search({ query: 'q' }),
      (err) => err.code === 'WEB_PROVIDER_CREDENTIAL_MISSING'
        && err.message.includes('TINYFISH_API_KEY'),
    )
  } finally {
    if (oldKey !== undefined) process.env.TINYFISH_API_KEY = oldKey
  }
})

test('mapTinyFishResponse dedupes by url and omits empty fields', () => {
  const result = mapTinyFishResponse({
    results: [
      { url: 'https://a.test', title: '', snippet: null, date: '' },
      { url: 'https://a.test', title: 'dup' },
      { url: 'https://b.test', publishedAt: '2026-01-02' },
    ],
  }, undefined)
  assert.deepEqual(result.sources, [
    { url: 'https://a.test' },
    { url: 'https://b.test', publishedAt: '2026-01-02' },
  ])
  assert.equal(result.truncated, false)
})