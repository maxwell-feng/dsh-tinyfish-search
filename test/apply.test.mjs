// Integration tests for the plugin's `apply()` wiring, run on the real
// `@deepseek-ai/cordis` runtime (devDependency), following the service
// patterns from the harness Cordis tutorial (docs/cordis-tutorial/03): stub
// services as Service subclasses mounted on a root context, then mount the
// plugin the way the loader would (an object plugin carrying `inject`).
import test from 'node:test'
import assert from 'node:assert/strict'
import { Context, Service } from '@deepseek-ai/cordis'
import {
  TINYFISH_PROVIDER_ID,
  TINYFISH_SETTINGS_NAMESPACE,
  TinyFishSearchProvider,
  apply,
  name as pluginName,
} from '../lib/index.js'

/** Web seam stub: records registrations; the disposer removes them. */
class FakeWeb extends Service {
  constructor(ctx) {
    super(ctx, 'web')
    this.registered = []
  }

  registerSearchProvider(provider) {
    this.registered.push(provider)
    return () => {
      const index = this.registered.indexOf(provider)
      if (index >= 0) this.registered.splice(index, 1)
    }
  }
}

/** Settings seam stub: records installSection calls exactly as the seam delivers them. */
class FakeSettings extends Service {
  constructor(ctx) {
    super(ctx, 'settings')
    this.installed = []
  }

  installSection(owner, ns, schema, entry, hooks) {
    this.installed.push({ owner, ns, schema, entry, hooks })
  }
}

/** Credentials seam stub: records every resolved ref; answers `value` or undefined. */
class FakeCredentials extends Service {
  constructor(ctx, answer) {
    super(ctx, 'credentials')
    this.seenRefs = []
    this.answer = answer
  }

  async resolve(ref) {
    this.seenRefs.push(String(ref))
    return this.answer === undefined ? undefined : { value: this.answer, source: 'test' }
  }
}

/** The plugin the way the loader mounts it: module exports as an object plugin. */
const pluginObject = { name: pluginName, inject: ['web'], apply }

/** Mount a root with the given stubs and the plugin; returns the service instances. */
async function mount({ settings = false, credentials = undefined, config = {} } = {}) {
  // `credentials === null` mounts a seam that resolves to "not stored";
  // `undefined` mounts none (the plugin must tolerate both).
  const mountCredentials = credentials !== undefined
  const root = new Context()
  root.plugin(FakeWeb)
  if (settings) root.plugin(FakeSettings)
  if (mountCredentials) root.plugin(FakeCredentials, credentials ?? undefined)
  root.plugin(pluginObject, config)
  // Settle every mounted fiber before asserting: plugin() returns a
  // thenable fiber, and the loader likewise awaits each mount.
  await new Promise((resolve, reject) => {
    const pending = []
    for (const runtime of root.registry.values()) {
      for (const fiber of runtime.fibers) pending.push(fiber.await())
    }
    void Promise.all(pending).then(resolve, reject)
  })
  return {
    root,
    web: root.get('web'),
    settingsService: settings ? root.get('settings') : undefined,
    credentialsService: mountCredentials ? root.get('credentials') : undefined,
  }
}

/** Stub global fetch; returns the previously installed impl for restore. */
function stubFetch(impl) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  return () => { globalThis.fetch = original }
}

test('apply registers the tinyfish provider on ctx.web', async () => {
  const { web } = await mount({ config: { apiKey: 'literal-key' } })
  assert.equal(web.registered.length, 1)
  assert.equal(web.registered[0].id, TINYFISH_PROVIDER_ID)
  assert.ok(web.registered[0] instanceof TinyFishSearchProvider)
  assert.equal(web.registered[0].available(), true)
})

test('apply works without the settings service (optional dependency)', async () => {
  const { web } = await mount({ config: { apiKey: 'k' } })
  assert.equal(web.registered.length, 1)
})

test('settings present: section installed under the plugin namespace with the entry as base', async () => {
  const { web, settingsService } = await mount({ settings: true, config: { apiKey: 'k', baseURL: 'https://cfg.example' } })
  assert.equal(settingsService.installed.length, 1)
  const install = settingsService.installed[0]
  assert.equal(install.ns, TINYFISH_SETTINGS_NAMESPACE)
  assert.equal(install.entry.baseURL, 'https://cfg.example')
  // The plugin registers the provider regardless; the hot-reload path is what
  // keeps the registration valid across committed edits.
  assert.equal(web.registered.length, 1)
})

test('a committed settings edit reaches the next search without re-registration', async () => {
  const { web, settingsService } = await mount({ settings: true, credentials: 'cred-key', config: { apiKey: 'k', baseURL: 'https://cfg.example' } })
  const install = settingsService.installed[0]
  // Simulate what installSection's setSource does after a committed user edit.
  install.hooks.setSource(() => ({ baseURL: 'https://settings.example/search' }))

  let seenUrl
  const restore = stubFetch(async (url) => {
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
    // A credentials seam with no stored answer: resolve() records the ref and
    // returns undefined, so the provider falls through to the (empty) ambient
    // environment and reports the stable missing-credential error.
    const { web, credentialsService } = await mount({ credentials: null, config: {} })
    const provider = web.registered[0]
    assert.equal(provider.available(), true, 'a resolver being present keeps the provider usable')
    await assert.rejects(provider.search({ query: 'q' }), (error) => {
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
  const { web } = await mount({ credentials: 'cred-key', config: {} })
  let seenKey
  const restore = stubFetch(async (url, init) => {
    seenKey = init.headers['x-api-key']
    return { ok: true, status: 200, async json() { return { results: [] } } }
  })
  try {
    await web.registered[0].search({ query: 'q' })
    assert.equal(seenKey, 'cred-key')
  } finally {
    restore()
  }
})

test('plugin metadata follows the harness conventions', () => {
  assert.equal(pluginName, 'dsh-tinyfish-search')
})
