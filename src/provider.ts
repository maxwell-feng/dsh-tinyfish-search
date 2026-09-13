import { WebError } from "@deepseek-ai/dsh-web";
import type {
  WebSearchProvider,
  WebSearchRequest,
  WebSearchResult,
  WebSearchSource,
} from "@deepseek-ai/dsh-web";
import {
  DEFAULT_API_KEY_ENV,
  TINYFISH_DEFAULT_BASE_URL,
  TINYFISH_PROVIDER_ID,
  USER_AGENT,
  nonEmpty,
} from "./config.ts";
import type {
  Config,
  TinyFishError,
  TinyFishOptions,
  TinyFishSearchResponse,
} from "./types.ts";

/** Throw the provider's stable cancellation error when the caller already aborted. */
function throwIfSearchAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) throw searchAborted(signal);
}

/** Build the provider's stable cancellation error while retaining the caller's reason. */
function searchAborted(signal?: AbortSignal, fallback?: unknown): WebError {
  return new WebError("TinyFish search aborted", "WEB_ABORTED", {
    cause: signal?.aborted === true ? signal.reason : fallback,
  });
}

/** True for a fetch/AbortSignal abort, surfaced as WEB_ABORTED. */
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Check whether a hostname is localhost, loopback, private or reserved address. */
export function isPrivateOrLocalHost(rawHostname: string): boolean {
  let host = rawHostname.toLowerCase().trim();
  if (host.startsWith("[") && host.endsWith("]")) {
    host = host.slice(1, -1);
  }
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "local" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan") ||
    host.endsWith(".corp") ||
    host === "0.0.0.0"
  ) {
    return true;
  }
  const parts = host.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p))) {
    const o1 = Number(parts[0]);
    const o2 = Number(parts[1]);
    const o3 = Number(parts[2]);
    const o4 = Number(parts[3]);
    if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return true;
    if (o1 === 0 || o1 === 10 || o1 === 127) return true;
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    if (o1 === 169 && o2 === 254) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 >= 224) return true;
    return false;
  }
  if (host.includes(":")) {
    if (host === "::1" || host === "::") return true;
    if (host.startsWith("::ffff:")) return isPrivateOrLocalHost(host.slice(7));
    if (/^fe[89ab]/i.test(host)) return true;
    if (/^f[cd]/i.test(host)) return true;
  }
  return false;
}

/**
 * Map a TinyFish search response to a normalized search result, deduped by
 * URL and capped early to `maxResults`.
 */
export function mapTinyFishResponse(
  payload: TinyFishSearchResponse,
  maxResults: number | undefined,
): WebSearchResult {
  const seen = new Set<string>();
  const sources: WebSearchSource[] = [];

  for (const item of Array.isArray(payload.results) ? payload.results : []) {
    if (maxResults !== undefined && sources.length >= maxResults) break;
    if (typeof item.url !== "string" || item.url.length === 0 || seen.has(item.url)) continue;
    seen.add(item.url);
    const publishedAt = item.publishedAt ?? item.date;
    sources.push({
      url: item.url,
      ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
      ...(typeof item.snippet === "string" && item.snippet.length > 0 ? { snippet: item.snippet } : {}),
      ...(typeof publishedAt === "string" && publishedAt.length > 0 ? { publishedAt } : {}),
    });
  }
  return { sources, truncated: false };
}

export class TinyFishSearchProvider implements WebSearchProvider {
  readonly id = TINYFISH_PROVIDER_ID;
  private readonly resolve: Config | (() => TinyFishOptions) | TinyFishOptions;

  constructor(resolve: Config | (() => TinyFishOptions) | TinyFishOptions) {
    this.resolve = resolve;
  }

  private opts(): TinyFishOptions {
    if (typeof this.resolve === "function") return (this.resolve as () => TinyFishOptions)();
    const c = this.resolve as Config | TinyFishOptions;

    if ("baseURL" in c && "apiKeyEnv" in c && typeof (c as any).baseURL === "string") {
      const o = c as TinyFishOptions;
      if (o.resolveApiKey === undefined) {
        const envName = o.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
        return {
          ...o,
          resolveApiKey: async () => (globalThis as any).process?.env?.[envName] ?? "",
        };
      }
      return o;
    }

    const cfg = c as Config;
    const envName = cfg.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
    return {
      ...(cfg.apiKey !== undefined && cfg.apiKey.length > 0 ? { apiKey: cfg.apiKey } : {}),
      apiKeyEnv: envName,
      baseURL: cfg.baseURL ?? TINYFISH_DEFAULT_BASE_URL,
      resolveApiKey: async () => (globalThis as any).process?.env?.[envName] ?? "",
      ...(nonEmpty(cfg.location) ? { location: cfg.location } : {}),
      ...(nonEmpty(cfg.language) ? { language: cfg.language } : {}),
    } as TinyFishOptions;
  }

  available(): boolean {
    const o = this.opts();
    const hasKey = (o.apiKey !== undefined && o.apiKey.length > 0) || o.resolveApiKey !== undefined;
    return hasKey && URL.canParse(o.baseURL);
  }

  async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
    const o = this.opts();
    const literal = o.apiKey;
    let apiKey = literal !== undefined && literal.length > 0 ? literal : "";
    if (apiKey.length === 0 && o.resolveApiKey !== undefined) {
      const v = await o.resolveApiKey();
      if (v !== undefined && v.length > 0) apiKey = v;
    }
    if (apiKey.length === 0) {
      const ref = o.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
      throw new WebError(
        `dsh-tinyfish-search has no API key for "${ref}"; set the environment variable,` +
          ` store it through the credentials service, or set a literal "apiKey"` +
          ` in the dsh-tinyfish-search config`,
        "WEB_PROVIDER_CREDENTIAL_MISSING",
      );
    }

    const url = new URL(o.baseURL);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new WebError("unsupported protocol for TinyFish search endpoint", "WEB_PROVIDER_ERROR");
    }
    if (isPrivateOrLocalHost(url.hostname)) {
      throw new WebError(`TinyFish search endpoint "${url.hostname}" is forbidden (SSRF protection)`, "WEB_PROVIDER_ERROR");
    }

    url.searchParams.set("query", request.query);
    if (o.location !== undefined) url.searchParams.set("location", o.location);
    if (o.language !== undefined) url.searchParams.set("language", o.language);
    throwIfSearchAborted(signal);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "x-api-key": apiKey,
          accept: "application/json",
          "user-agent": USER_AGENT,
        },
        ...(signal !== undefined ? { signal } : {}),
      });
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw searchAborted(signal, error);
      throw new WebError(`TinyFish search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", {
        cause: error,
      });
    }

    if (!response.ok) {
      const status = response.status;
      let message = `TinyFish API error (HTTP ${status})`;
      try {
        const parsed = (await response.json()) as TinyFishError;
        const detail =
          typeof parsed.error === "string" ? parsed.error : parsed.error?.message ?? parsed.message;
        if (detail !== undefined && detail.length > 0) message = detail;
      } catch (error: unknown) {
        if (signal?.aborted === true || isAbortError(error)) throw searchAborted(signal, error);
      }
      throw new WebError(message, "WEB_PROVIDER_ERROR");
    }

    try {
      const payload = (await response.json()) as TinyFishSearchResponse;
      return mapTinyFishResponse(payload, request.maxResults);
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw searchAborted(signal, error);
      if (error instanceof WebError) throw error;
      throw new WebError(
        `TinyFish returned an unprocessable response body: ${String(error)}`,
        "WEB_PROVIDER_ERROR",
        { cause: error },
      );
    }
  }
}
