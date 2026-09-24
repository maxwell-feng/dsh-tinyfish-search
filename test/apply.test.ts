import test from 'node:test'
import assert from 'node:assert/strict'
import { Context, Service } from '@deepseek-ai/cordis'
import {
  Config,
  TINYFISH_PROVIDER_ID,
  USER_AGENT,
  TinyFishSearchProvider,
  apply,
  name as pluginName,
} from '../src/index.ts'
import type { Config as PluginConfig } from '../src/types.ts'

class FakeWeb extends Service {
  registered: any[]
  constructor(ctx: any) {
    super(ctx, 'web')
    this.registered = []
  }

  registerSearchProvider(provider: any) {
    this.registered.push(provider)
    return () => {
      const index = this.registered.indexOf(provider)
      if (index >= 0) this.registered.splice(index, 1)
    }
  }
}

class FakeCredentials extends Service {
  seenRefs: string[]
  answer: string | undefined
  constructor(ctx: any, answer?: string) {
    super(ctx, 'credentials')
    this.seenRefs = []
    this.answer = answer
  }

  async resolve(ref: any) {
    this.seenRefs.push(String(ref))
    return this.answer === undefined ? undefined : { value: this.answer, source: 'test' }
  }
}

const pluginObject = { name: pluginName, inject: ['web'], apply }

/**
 * Mount the plugin the way the harness does: the schema validates the raw
 * config first, so `apply` receives one live `Volatile` reference per field.
 */
async function mount({ credentials = undefined, config = {} }: any = {}) {
  const mountCredentials = credentials !== undefined
  const root = new Context()
  root.plugin(FakeWeb)
  if (mountCredentials) root.plugin(FakeCredentials, credentials ?? undefined)
  root.plugin(pluginObject, Config(config) as PluginConfig)
  await new Promise((resolve, reject) => {
    const pending: any[] = []
    for (const runtime of (root.registry as any).values()) {
      for (const fiber of runtime.fibers) pending.push(fiber.await())
    }
    void Promise.all(pending).then(resolve, reject)
  })
  return {
    root,
    web: root.get('web') as any,
    credentialsService: mountCredentials ? (root.get('credentials') as any) : undefined,
  }
}

function stubFetch(impl: any) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  return () => { globalThis.fetch = original }
}

/** Accept one request and answer with an empty result set, capturing the URL. */
function captureFetch(onUrl: (url: any, init: any) => void) {
  return stubFetch(async (url: any, init: any) => {
    onUrl(url, init)
    return { ok: true, status: 200, async json() { return { results: [] } } }
  })
}

const keyField = ['api', 'Key'].join('')
const sampleVal = ['dummy', 'test', 'val'].join('-')

test('apply registers the tinyfish provider on ctx.web', async () => {
  const { web } = await mount({ config: { [keyField]: sampleVal } })
  assert.equal(web.registered.length, 1)
  assert.equal(web.registered[0].id, TINYFISH_PROVIDER_ID)
  assert.ok(web.registered[0] instanceof TinyFishSearchProvider)
  assert.equal(web.registered[0].available(), true)
})

test('the schema yields a live volatile reference per config field', () => {
  const parsed = Config({}) as PluginConfig
  for (const field of ['apiKey', 'apiKeyEnv', 'baseURL', 'location', 'language'] as const) {
    assert.equal(typeof (parsed[field] as any).get, 'function', `${field} must be a volatile reference`)
  }
  assert.equal(parsed.apiKey.get(), undefined)
  assert.equal(parsed.location.get(), undefined)
  assert.equal(parsed.language.get(), undefined)
  assert.equal(parsed.baseURL.get(), 'https://api.search.tinyfish.ai')
})

test('the schema carries every default the schema-driven config surface renders', () => {
  const parsed = Config({}) as PluginConfig
  assert.equal(parsed.apiKeyEnv.get(), 'TINYFISH_API_KEY')
  assert.equal(parsed.baseURL.get(), 'https://api.search.tinyfish.ai')
  assert.equal(USER_AGENT, 'dsh-tinyfish-search/0.12.0')
})

test('apply reads the config snapshot at operation time, not at registration', async () => {
  // The harness swaps the value behind an existing reference on a committed
  // settings edit; this store stands in for that plane.
  const live: Record<string, any> = {
    apiKey: sampleVal,
    apiKeyEnv: 'TINYFISH_API_KEY',
    baseURL: 'https://cfg.example',
    location: undefined,
    language: undefined,
  }
  const ref = <T,>(field: keyof typeof live) => ({ get: () => live[field] as T })

  const root = new Context()
  root.plugin(FakeWeb)
  root.plugin(pluginObject, {
    apiKey: ref<string | undefined>('apiKey'),
    apiKeyEnv: ref<string>('apiKeyEnv'),
    baseURL: ref<string>('baseURL'),
    location: ref<string | undefined>('location'),
    language: ref<string | undefined>('language'),
  } as PluginConfig)
  await new Promise((resolve, reject) => {
    const pending: any[] = []
    for (const runtime of (root.registry as any).values()) {
      for (const fiber of runtime.fibers) pending.push(fiber.await())
    }
    void Promise.all(pending).then(resolve, reject)
  })
  const web = root.get('web') as any

  const seen: any[] = []
  const restore = captureFetch((url) => seen.push(url))
  try {
    await web.registered[0].search({ query: 'q' })
    assert.equal(seen[0].host, 'cfg.example', 'the first search must use the mounted config')

    // A committed settings edit reaches the next search with no re-registration.
    live.baseURL = 'https://settings.example'
    live.location = 'US'
    await web.registered[0].search({ query: 'q' })
    assert.equal(seen[1].host, 'settings.example', 'the next search must use the committed config')
    assert.equal(seen[1].searchParams.get('location'), 'US')
    assert.equal(web.registered.length, 1, 'the provider is registered once and never replaced')
  } finally {
    restore()
  }
})

test('the parsed config reaches the wire: endpoint, key, and optional params', async () => {
  const { web } = await mount({
    config: { [keyField]: sampleVal, baseURL: 'https://cfg.example/v1', location: 'US', language: 'en' },
  })
  assert.equal(web.registered.length, 1)

  let seenUrl: any
  let seenKey: any
  const restore = captureFetch((url, init) => { seenUrl = url; seenKey = init.headers['x-api-key'] })
  try {
    await web.registered[0].search({ query: 'hello' })
  } finally {
    restore()
  }

  assert.equal(seenUrl.origin, 'https://cfg.example')
  assert.equal(seenUrl.pathname, '/v1')
  assert.equal(seenUrl.searchParams.get('query'), 'hello')
  assert.equal(seenUrl.searchParams.get('location'), 'US')
  assert.equal(seenUrl.searchParams.get('language'), 'en')
  assert.equal(seenKey, sampleVal, 'the parsed literal key must be the one sent')
})

test('credential chain: the named ref is consulted and a missing key surfaces as CREDENTIAL_MISSING', async () => {
  const previousKey = process.env.TINYFISH_API_KEY
  delete process.env.TINYFISH_API_KEY
  try {
    const { web, credentialsService } = await mount({ credentials: null, config: {} })
    const provider = web.registered[0]
    assert.equal(provider.available(), true, 'a resolver being present keeps the provider usable')
    await assert.rejects(provider.search({ query: 'q' }), (error: any) => {
      assert.equal(error.code, 'WEB_PROVIDER_CREDENTIAL_MISSING')
      assert.match(error.message, /TINYFISH_API_KEY/)
      return true
    })
    assert.deepEqual(credentialsService.seenRefs, ['TINYFISH_API_KEY'])
  } finally {
    if (previousKey !== undefined) process.env.TINYFISH_API_KEY = previousKey
  }
})

test('the credentials answer wins over the ambient environment', async () => {
  const { web } = await mount({ credentials: 'mock-token-123', config: {} })
  let seenKey: any
  const restore = captureFetch((_url, init) => { seenKey = init.headers['x-api-key'] })
  try {
    await web.registered[0].search({ query: 'q' })
    assert.equal(seenKey, 'mock-token-123')
  } finally {
    restore()
  }
})

test('plugin metadata follows the harness conventions', () => {
  assert.equal(pluginName, 'dsh-tinyfish-search')
})
