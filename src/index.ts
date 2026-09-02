/**
 * dsh-tinyfish-search — a TinyFish-backed `web_search` provider for DeepSeek Harness.
 *
 * The plugin registers a {@link WebSearchProvider} on the web capability seam
 * (`ctx.web`) with the stable id `tinyfish`. The built-in model-facing
 * `web_search` tool (from `dsh-tool-web`) then runs every query through the
 * TinyFish Search API (`GET https://api.search.tinyfish.ai`) instead of the
 * DeepSeek Anthropic-compatible endpoint.
 *
 * Unlike `web-search-deepseek`, no model call is involved: the provider is a
 * plain REST client. Each search is one GET request — fast, free (TinyFish
 * Search is free at any wallet balance), and cheap on tokens.
 *
 * @module dsh-tinyfish-search
 */

import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import {
  WebError,
} from '@deepseek-ai/dsh-web'
import type {
  WebSearchProvider,
  WebSearchRequest,
  WebSearchResult,
  WebSearchSource,
} from '@deepseek-ai/dsh-web'

/** Stable provider id this plugin registers under. */
export const TINYFISH_PROVIDER_ID = 'tinyfish'

/**
 * Minimal module-scoped `process` reference (only `process.env` is used). The
 * package deliberately avoids an `@types/node` dependency, so Node globals
 * are declared where needed instead.
 */
declare const process: { env: Record<string, string | undefined> }

/** TinyFish canonical Search API endpoint (GET). */
export const TINYFISH_DEFAULT_BASE_URL = 'https://api.search.tinyfish.ai'

/** Environment variable carrying the TinyFish API key. */
export const DEFAULT_API_KEY_ENV = 'TINYFISH_API_KEY'

/** Attribution header sent on every request. Bump with the package version. */
const USER_AGENT = 'dsh-tinyfish-search/0.1.7'

/** Cordis plugin name used by loader diagnostics and the bundle patch row. */
export const name = 'dsh-tinyfish-search'

/** The web capability seam provides the provider registry (`ctx.web`). */
export const inject = ['web'] as const

/** Plugin config (all optional — `apply` fills env-var and constant defaults). */
export interface Config {
  /** Literal TinyFish API key; prefer `apiKeyEnv` so no secret enters configuration files. */
  apiKey?: string
  /** Environment variable carrying the TinyFish API key; defaults to `TINYFISH_API_KEY`. */
  apiKeyEnv?: string
  /** TinyFish Search API endpoint base; defaults to `https://api.search.tinyfish.ai`. */
  baseURL?: string
}

export const Config: Schema<Config> = Schema.object({
  apiKey: Schema.string().role('secret'),
  apiKeyEnv: Schema.string().role('credential-ref').default(DEFAULT_API_KEY_ENV),
  baseURL: Schema.string().default(TINYFISH_DEFAULT_BASE_URL),
})

export interface TinyFishOptions {
  readonly apiKey?: string
  readonly resolveApiKey?: () => Promise<string | undefined>
  readonly apiKeyEnv: string
  readonly baseURL: string
}

function resolveOptions(ctx: Context, config: Config): TinyFishOptions {
  const apiKeyEnv = credentialRef(config.apiKeyEnv ?? DEFAULT_API_KEY_ENV)
  const literal = config.apiKey !== undefined && config.apiKey.length > 0 ? config.apiKey : undefined
  return {
    ...literal === undefined ? {} : { apiKey: literal },
    resolveApiKey: async () => {
      const creds = (ctx as any).get?.('credentials')
      if (creds !== undefined) {
        const v = await creds.resolve(apiKeyEnv)
        if (v !== undefined && v.value.length > 0) return v.value
      }
      const ambient = launchEnvironmentOf(ctx as any).get(apiKeyEnv)
      if (ambient !== undefined && ambient.value.length > 0) return ambient.value
      // Fallback to Node process.env for standalone tests
      const envVal = (globalThis as any).process?.env?.[String(apiKeyEnv)]
      if (envVal !== undefined && envVal.length > 0) return envVal
      return undefined
    },
    apiKeyEnv: String(apiKeyEnv),
    baseURL: config.baseURL ?? TINYFISH_DEFAULT_BASE_URL,
  }
}

/** Register the TinyFish search provider with `ctx.web`. */
export function apply(ctx: Context, config: Config): void {
  let current: () => Config = () => config
  // Keep config hot-reloadable via settings if the host provides it
  try {
    const maybeSettings: any = (ctx as any).get?.('settings')
    if (maybeSettings !== undefined) {
      // No-op if settings service is not available in this profile
    }
  } catch {}
  ctx.web.registerSearchProvider(new TinyFishSearchProvider(() => resolveOptions(ctx, current())))
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** One result item in the TinyFish Search API response. */
export interface TinyFishResultItem {
  readonly position?: number
  readonly site_name?: string
  readonly title?: string
  readonly snippet?: string
  readonly url: string
  /** Publication date; TinyFish may name it `date` or `publishedAt`. */
  readonly date?: string | null
  readonly publishedAt?: string | null
}

/** TinyFish Search API response envelope. */
export interface TinyFishSearchResponse {
  readonly query?: string
  readonly results?: TinyFishResultItem[]
  readonly total_results?: number
  readonly page?: number
}

/** TinyFish error envelope (best-effort; fields vary). */
export interface TinyFishError {
  readonly error?: { code?: string; message?: string } | string
  readonly message?: string
}

/**
 * The TinyFish-backed search provider. One GET per query; maps
 * `results[]` items to the seam's portable {@link WebSearchSource} shape.
 * `available()` is a cheap local check that makes no network calls.
 */
export class TinyFishSearchProvider implements WebSearchProvider {
  readonly id = TINYFISH_PROVIDER_ID

  // `options` may be a plain Config (tests) or a thunk returning resolved options (host apply)
  constructor(private readonly resolve: Config | (() => TinyFishOptions) | TinyFishOptions) {}

  private opts(): TinyFishOptions {
    if (typeof this.resolve === 'function') return (this.resolve as () => TinyFishOptions)()
    const c = this.resolve as Config | TinyFishOptions
    // If it already looks like TinyFishOptions (has baseURL + apiKeyEnv), use it
    if ('baseURL' in c && 'apiKeyEnv' in c && typeof (c as any).baseURL === 'string') {
      const o = c as TinyFishOptions
      // Ensure resolveApiKey exists for plain objects (fallback to process.env)
      if (o.resolveApiKey === undefined) {
        const envName = o.apiKeyEnv ?? DEFAULT_API_KEY_ENV
        return { ...o, resolveApiKey: async () => (globalThis as any).process?.env?.[envName] ?? '' }
      }
      return o
    }
    const cfg = c as Config
    const envName = cfg.apiKeyEnv ?? DEFAULT_API_KEY_ENV
    return {
      ...cfg.apiKey !== undefined && cfg.apiKey.length > 0 ? { apiKey: cfg.apiKey } : {},
      apiKeyEnv: envName,
      baseURL: cfg.baseURL ?? TINYFISH_DEFAULT_BASE_URL,
      resolveApiKey: async () => (globalThis as any).process?.env?.[envName] ?? '',
    } as TinyFishOptions
  }

  available(): boolean {
    const o = this.opts()
    // Mirrors dsh-web-search-deepseek: a provider with a resolver is considered usable
    // even when the key is not yet set, so selection does not hide it as "unavailable".
    // Missing credentials then surface as WEB_PROVIDER_CREDENTIAL_MISSING at search time.
    const hasKey = (o.apiKey !== undefined && o.apiKey.length > 0) || o.resolveApiKey !== undefined
    return hasKey && URL.canParse(o.baseURL)
  }

  async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
    const o = this.opts()
    const literal = o.apiKey
    let apiKey = literal !== undefined && literal.length > 0 ? literal : ''
    if (apiKey.length === 0 && o.resolveApiKey !== undefined) {
      const v = await o.resolveApiKey()
      if (v !== undefined && v.length > 0) apiKey = v
    }
    if (apiKey.length === 0) {
      const ref = o.apiKeyEnv ?? DEFAULT_API_KEY_ENV
      throw new WebError(
        `dsh-tinyfish-search has no API key for "${ref}"; set the environment variable,`
        + ` store it through the credentials service, or set a literal "apiKey"`
        + ` in the dsh-tinyfish-search config`,
        'WEB_PROVIDER_CREDENTIAL_MISSING',
      )
    }

    const url = new URL(o.baseURL)
    url.searchParams.set('query', request.query)
    throwIfSearchAborted(signal)

    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'x-api-key': apiKey,
          'accept': 'application/json',
          'user-agent': USER_AGENT,
        },
        ...signal !== undefined ? { signal } : {},
      })
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw searchAborted(signal, error)
      throw new WebError(`TinyFish search request failed: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
    }

    if (!response.ok) {
      const status = response.status
      let message = `TinyFish API error (HTTP ${status})`
      try {
        const parsed = await response.json() as TinyFishError
        const detail = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message ?? parsed.message
        if (detail !== undefined && detail.length > 0) message = detail
      } catch (error: unknown) {
        // An abort fired mid-body must surface as WEB_ABORTED, not be
        // swallowed into a generic HTTP-error message.
        if (signal?.aborted === true || isAbortError(error)) throw searchAborted(signal, error)
      }
      throw new WebError(message, 'WEB_PROVIDER_ERROR')
    }

    try {
      const payload = await response.json() as TinyFishSearchResponse
      return mapTinyFishResponse(payload, request.maxResults)
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw searchAborted(signal, error)
      if (error instanceof WebError) throw error
      throw new WebError(`TinyFish returned an unprocessable response body: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
    }
  }
}

/**
 * Map a TinyFish search response to a normalized search result, deduped by
 * URL and capped early to `maxResults` as a cost/latency optimization (the
 * seam enforces the bound regardless). `truncated` stays `false`: the web
 * service owns the final truncation flag.
 *
 * @param payload - the parsed Search API response body.
 * @param maxResults - optional upper bound on returned sources.
 * @returns the normalized result.
 */
export function mapTinyFishResponse(
  payload: TinyFishSearchResponse,
  maxResults: number | undefined,
): WebSearchResult {
  const seen = new Set<string>()
  const sources: WebSearchSource[] = []
  for (const item of payload.results ?? []) {
    if (maxResults !== undefined && sources.length >= maxResults) break
    if (item.url.length === 0 || seen.has(item.url)) continue
    seen.add(item.url)
    const publishedAt = item.publishedAt ?? item.date
    sources.push({
      url: item.url,
      ...item.title !== undefined && item.title !== null && item.title.length > 0 ? { title: item.title } : {},
      ...item.snippet !== undefined && item.snippet !== null && item.snippet.length > 0 ? { snippet: item.snippet } : {},
      ...publishedAt !== undefined && publishedAt !== null && publishedAt.length > 0 ? { publishedAt } : {},
    })
  }
  return { sources, truncated: false }
}

/** Throw the provider's stable cancellation error when the caller already aborted. */
function throwIfSearchAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) throw searchAborted(signal)
}

/** Build the provider's stable cancellation error while retaining the caller's reason. */
function searchAborted(signal?: AbortSignal, fallback?: unknown): WebError {
  return new WebError('TinyFish search aborted', 'WEB_ABORTED', {
    cause: signal?.aborted === true ? signal.reason : fallback,
  })
}

/** True for a fetch/`AbortSignal` abort, surfaced as `WEB_ABORTED`. */
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}