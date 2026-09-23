/**
 * dsh-tinyfish-search — a TinyFish-backed `web_search` provider for DeepSeek Harness.
 *
 * @module dsh-tinyfish-search
 */

import type { Context } from "@deepseek-ai/cordis";
import { Config, DEFAULT_API_KEY_ENV, TINYFISH_DEFAULT_BASE_URL, TINYFISH_PROVIDER_ID } from "./config.ts";
import { resolveOptions } from "./options.ts";
import { TinyFishSearchProvider } from "./provider.ts";
import type { Config as PluginConfig } from "./types.ts";

// Type-only: pulls the ctx.web merge (WebService) into this program.
import type {} from "@deepseek-ai/dsh-web";

export const name = "dsh-tinyfish-search";

export const inject = ["web"] as const;

export {
  Config,
  DEFAULT_API_KEY_ENV,
  TINYFISH_DEFAULT_BASE_URL,
  TINYFISH_PROVIDER_ID,
  USER_AGENT,
} from "./config.ts";
export { resolveOptions } from "./options.ts";
export { TinyFishSearchProvider, mapTinyFishResponse } from "./provider.ts";
export * from "./types.ts";

/**
 * Register the TinyFish search provider with `ctx.web`.
 *
 * Every search reads the current config snapshot at its start, so a committed
 * settings edit reaches the next search without re-registration.
 */
export function apply(ctx: Context, config: PluginConfig): void {
  ctx.web.registerSearchProvider(new TinyFishSearchProvider(() => resolveOptions(ctx, {
    apiKey: config.apiKey.get(),
    apiKeyEnv: config.apiKeyEnv.get(),
    baseURL: config.baseURL.get(),
    location: config.location.get(),
    language: config.language.get(),
  })));
}
