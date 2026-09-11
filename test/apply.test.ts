import test from 'node:test'
import assert from 'node:assert/strict'
import { Context, Service } from '@deepseek-ai/cordis'
import {
  TINYFISH_PROVIDER_ID,
  TINYFISH_SETTINGS_NAMESPACE,
  TinyFishSearchProvider,
  apply,
  name as pluginName,
} from '../src/index.ts'

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

class FakeSettings extends Service {
  installed: any[]
  constructor(ctx: any) {
    super(ctx, 'settings')
    this.installed = []
  }

  installSection(owner: any, ns: any, schema: any, entry: any, hooks: any) {
    this.installed.push({ owner, ns, schema, entry, hooks })
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

async function mount({ settings = false, credentials = undefined, config = {} }: any = {}) {
  const mountCredentials = credentials !== undefined
  const root = new Context()
  root.plugin(FakeWeb)
  if (settings) root.plugin(FakeSettings)
  if (mountCredentials) root.plugin(FakeCredentials, credentials ?? undefined)
  root.plugin(pluginObject, config)
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
    settingsService: settings ? (root.get('settings') as any) : undefined,
    credentialsService: mountCredentials ? (root.get('credentials') as any) : undefined,
  }
}

function stubFetch(impl: any) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  return () => { globalThis.fetch = original }
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

test('apply works without the settings service (optional dependency)', async () => {
  const { web } = await mount({ config: { [keyField]: sampleVal } })
  assert.equal(web.registered.length, 1)
})

test('settings present: section installed under the plugin namespace with the entry as base', async () => {
  const { web, settingsService } = await mount({ settings: true, config: { [keyField]: sampleVal, baseURL: 'https://cfg.example' } })
  assert.equal(settingsService.installed.length, 1)
  const install = settingsService.installed[0]
  assert.equal(install.ns, TINYFISH_SETTINGS_NAMESPACE)
  assert.equal(install.entry.baseURL, 'https://cfg.example')
  assert.equal(web.registered.length, 1)
})

test('a committed settings edit reaches the next search without re-registration', async () => {
  const { web, settingsService } = await mount({ settings: true, credentials: 'cred-val-mock', config: { [keyField]: sampleVal, baseURL: 'https://cfg.example' } })
  const install = settingsService.installed[0]
  install.hooks.setSource(() => ({ baseURL: 'https://settings.example/search' }))

  let seenUrl: any
  const restore = stubFetch(async (url: any) => {
    seenUrl = url
    return { ok: true, status: 200, async json() { return { results: [] } } }
  })
  try {
    await web.registered[0].search({ query: 'q' })
    assert.equal(seenUrl.host, 'settings.example', 'the next search must use the committed section')
  } finally {
    restore()
  }
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
  const restore = stubFetch(async (url: any, init: any) => {
    seenKey = init.headers['x-api-key']
    return { ok: true, status: 200, async json() { return { results: [] } } }
  })
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
