/**
 * dsh-tinyfish-search — a TinyFish-backed `web_search` provider for DeepSeek Harness.
 *
 * @module dsh-tinyfish-search
 */

import type { Context } from "@deepseek-ai/cordis";
import {
  Config,
  DEFAULT_API_KEY_ENV,
  TINYFISH_DEFAULT_BASE_URL,
  TINYFISH_PROVIDER_ID,
  TINYFISH_SETTINGS_NAMESPACE,
} from "./config.js";
import { resolveOptions } from "./options.js";
import { TinyFishSearchProvider } from "./provider.js";
import type { Config as PluginConfig } from "./types.js";

// Type-only: pulls the ctx.settings merge (SettingsProvider) into this program.
import type {} from "@deepseek-ai/dsh-settings";

export const name = "dsh-tinyfish-search";

export const inject = ["web"] as const;

export {
  Config,
  DEFAULT_API_KEY_ENV,
  TINYFISH_DEFAULT_BASE_URL,
  TINYFISH_PROVIDER_ID,
  TINYFISH_SETTINGS_NAMESPACE,
} from "./config.js";
export { resolveOptions } from "./options.js";
export { TinyFishSearchProvider, mapTinyFishResponse } from "./provider.js";
export * from "./types.js";

/** Register the TinyFish search provider with `ctx.web`. */
export function apply(ctx: Context, config: PluginConfig): void {
  let current: () => PluginConfig = () => config;

  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.installSection(ctx, TINYFISH_SETTINGS_NAMESPACE, Config, config, {
      setSource: (source) => {
        current = source;
      },
      onChange: () => {},
    });
  });

  ctx.web.registerSearchProvider(new TinyFishSearchProvider(() => resolveOptions(ctx, current())));
}
