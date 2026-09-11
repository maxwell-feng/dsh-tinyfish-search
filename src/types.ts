export interface Config {
  /** Literal TinyFish API key; prefer `apiKeyEnv` so no secret enters configuration files. */
  apiKey?: string
  /** Environment variable carrying the TinyFish API key; defaults to `TINYFISH_API_KEY`. */
  apiKeyEnv?: string
  /** TinyFish Search API endpoint base; defaults to `https://api.search.tinyfish.ai`. */
  baseURL?: string
  /** Optional geo location forwarded to TinyFish as `location` (e.g. `US`); unset sends nothing. */
  location?: string
  /** Optional search language forwarded to TinyFish as `language` (e.g. `en`); unset sends nothing. */
  language?: string
}

export interface TinyFishOptions {
  readonly apiKey?: string
  readonly resolveApiKey?: () => Promise<string | undefined>
  readonly apiKeyEnv: string
  readonly baseURL: string
  readonly location?: string
  readonly language?: string
}

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
