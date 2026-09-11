import type { Context } from "@deepseek-ai/cordis";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { DEFAULT_API_KEY_ENV, TINYFISH_DEFAULT_BASE_URL, nonEmpty } from "./config.ts";
import type { Config, TinyFishOptions } from "./types.ts";

export function resolveOptions(ctx: Context, config: Config): TinyFishOptions {
  const apiKeyEnv = credentialRef(config.apiKeyEnv ?? DEFAULT_API_KEY_ENV);
  const literal = config.apiKey !== undefined && config.apiKey.length > 0 ? config.apiKey : undefined;

  return {
    ...(literal === undefined ? {} : { apiKey: literal }),
    resolveApiKey: async () => {
      const creds = (ctx as any).get?.("credentials");
      if (creds !== undefined) {
        const v = await creds.resolve(apiKeyEnv);
        if (v !== undefined && v.value.length > 0) return v.value;
      }
      const ambient = launchEnvironmentOf(ctx as any).get(apiKeyEnv);
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
