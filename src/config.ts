import Schema from "@deepseek-ai/schemastery";

/** Stable provider id this plugin registers under. */
export const TINYFISH_PROVIDER_ID = "tinyfish";

/** TinyFish canonical Search API endpoint (GET). */
export const TINYFISH_DEFAULT_BASE_URL = "https://api.search.tinyfish.ai";

/** Environment variable carrying the TinyFish API key. */
export const DEFAULT_API_KEY_ENV = "TINYFISH_API_KEY";

/** Attribution header sent on every request. */
export const USER_AGENT = "dsh-tinyfish-search/0.12.0";

/**
 * Plugin config schema. Every field is `.volatile()`, so a validated config
 * carries a live reference per field and a committed settings edit reaches the
 * next search without re-registration. Defaults live on the schema, not only
 * at the use site: a configuration surface renders the resolved section, so a
 * default the schema does not carry reads there as no value at all.
 *
 * The exported schema is the source of truth for the parsed shape; the
 * `Config` interface in `types.ts` is the hand-written twin `apply` consumes.
 */
export const Config = Schema.object({
  apiKey: Schema.string().role("secret").volatile(),
  apiKeyEnv: Schema.string().role("credential-ref").default(DEFAULT_API_KEY_ENV).volatile(),
  baseURL: Schema.string().default(TINYFISH_DEFAULT_BASE_URL).volatile(),
  location: Schema.string().volatile(),
  language: Schema.string().volatile(),
});

/** True for a defined, non-empty, non-whitespace-only string. */
export function nonEmpty(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}
