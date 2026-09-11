import Schema from "@deepseek-ai/schemastery";
import type { Config as PluginConfig } from "./types.ts";

/** Stable provider id this plugin registers under. */
export const TINYFISH_PROVIDER_ID = "tinyfish";

/** Settings namespace for the configuration card / user document. */
export const TINYFISH_SETTINGS_NAMESPACE = "dsh-tinyfish-search";

/** TinyFish canonical Search API endpoint (GET). */
export const TINYFISH_DEFAULT_BASE_URL = "https://api.search.tinyfish.ai";

/** Environment variable carrying the TinyFish API key. */
export const DEFAULT_API_KEY_ENV = "TINYFISH_API_KEY";

/** Attribution header sent on every request. */
export const USER_AGENT = "dsh-tinyfish-search/0.8.0";

export const Config: Schema<PluginConfig> = Schema.object({
  apiKey: Schema.string().role("secret"),
  apiKeyEnv: Schema.string().role("credential-ref").default(DEFAULT_API_KEY_ENV),
  baseURL: Schema.string().default(TINYFISH_DEFAULT_BASE_URL),
  location: Schema.string(),
  language: Schema.string(),
});

/** True for a defined, non-empty, non-whitespace-only string. */
export function nonEmpty(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}
