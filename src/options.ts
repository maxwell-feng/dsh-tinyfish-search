import type { Context } from "@deepseek-ai/cordis";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { TINYFISH_DEFAULT_BASE_URL, nonEmpty } from "./config.ts";
import type { Config, TinyFishOptions } from "./types.ts";

/**
 * Project one config snapshot into the options the provider serves its next
 * search with. The caller reads every `.get()` first, so each search sees one
 * consistent snapshot; environment fallbacks stay here rather than in the
 * provider, because every value it reads is already fully defaulted.
 * @param ctx - plugin context supplying the credential and environment planes.
 * @param config - the currently authoritative config, already unwrapped.
 * @returns options for one search.
 */
export function resolveOptions(
  ctx: Context,
  config: { [K in keyof Config]: ReturnType<Config[K]["get"]> },
): TinyFishOptions {
  const apiKeyEnv = credentialRef(config.apiKeyEnv);
  const literal = config.apiKey !== undefined && config.apiKey.length > 0 ? config.apiKey : undefined;

  return {
    ...(literal === undefined ? {} : { apiKey: literal }),
    resolveApiKey: async () => {
      const creds = ctx.get("credentials");
      if (creds !== undefined) {
        const v = await creds.resolve(apiKeyEnv);
        if (v !== undefined && v.value.length > 0) return v.value;
      }
      const ambient = launchEnvironmentOf(ctx).get(apiKeyEnv);
      if (ambient !== undefined && ambient.value.length > 0) return ambient.value;
      // Fallback to ambient process.env for tests and direct callers
      const envVal = (globalThis as any).process?.env?.[String(apiKeyEnv)];
      if (envVal !== undefined && envVal.length > 0) return envVal;
      return undefined;
    },
    apiKeyEnv: String(apiKeyEnv),
    baseURL: config.baseURL ?? TINYFISH_DEFAULT_BASE_URL,
    ...(nonEmpty(config.location) ? { location: config.location } : {}),
    ...(nonEmpty(config.language) ? { language: config.language } : {}),
  };
}
