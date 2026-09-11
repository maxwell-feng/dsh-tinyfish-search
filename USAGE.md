# Usage Guide

English | [简体中文](USAGE.zh.md)

> Verified against DeepSeek Harness **0.1.5-rc.2** with `dsh-tinyfish-search` **0.8.0**. All wire outputs below were captured from the shipped `lib/` build.

This document explains how searches flow through the plugin, which providers are involved, how credentials resolve, and what errors look like — with runnable examples.

---

## 1. How a search flows

In any session on a profile that composes this bundle, the model calls `web_search` exactly as usual. The harness routes the call through the web capability seam to this plugin's provider:

```text
model → web_search → ctx.web → tinyfish → GET https://api.search.tinyfish.ai
```

Concretely, one search is one HTTP request (verified against the built output):

```text
GET https://api.search.tinyfish.ai/?query=hello+world&location=US&language=en
x-api-key: <your TinyFish key>
user-agent: dsh-tinyfish-search/0.8.0
accept: application/json
```

`location` / `language` are only sent when configured; otherwise the request carries just `query`. No model call is consumed per search.

---

## 2. Providers

The bundle patch composes two rows that decide which backend answers:

| Row | Effect |
|---|---|
| `web` | Points the seam at this provider: `searchProvider: tinyfish` (`fetchProvider: http` restated) |
| `tool-web` | Re-enables the host-level model-facing tools (`disabled: false`, `search: true`, `fetch: true`, timeouts restated) |

The provider registers under the stable id `tinyfish` (`TINYFISH_PROVIDER_ID`) and exposes its settings under the `dsh-tinyfish-search` namespace (`TINYFISH_SETTINGS_NAMESPACE`). `available()` is a cheap local check — key present (or resolvable) plus a parseable `baseURL` — and makes no network calls. A provider with a credential resolver counts as usable even before the key exists, so a missing key surfaces at search time as `WEB_PROVIDER_CREDENTIAL_MISSING`, never as “unavailable”.

Per-preset scoping: the host `tool-web` row makes the tools visible to every agent preset on the profile. A preset mounting its own `tool-web` row shadows the global registration for its agents. To scope the tools to one preset, override or remove the `tool-web` row in the profile's `cordis.patch.yml` and add `tool-web` to that preset's agent composition.

---

## 3. Credential configuration

The API key resolves in this order per search (first non-empty value wins):

1. Literal `apiKey` in the plugin config (secret role — prefer not to commit it).
2. The credentials service: `ctx.credentials.resolve(apiKeyEnv)`.
3. The launch environment: `launchEnvironmentOf(ctx).get(apiKeyEnv)`.
4. `process.env[apiKeyEnv]` (covers standalone use outside the host).

`apiKeyEnv` defaults to `TINYFISH_API_KEY` and carries the `credential-ref` role, so the settings UI offers the credential picker. A committed settings edit (new key, new `baseURL`, new targeting) reaches the next search without a restart.

Recommended setup — environment variable only, no YAML changes:

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # permanent — takes effect in new terminals
$env:TINYFISH_API_KEY = "your_api_key_here"  # current session only
```

---

## 4. Examples

### 4.1 In-session search

Ask anything requiring live information:

```text
What is today's weather in Tokyo?
```

The model calls `web_search`, the harness routes it to TinyFish, and the tool result carries normalized sources. In the GUI, **Settings → Web Search** shows provider `tinyfish` with `available: true` once the key is configured.

### 4.2 Normalized result shape

`results[]` items map to the seam's portable `WebSearchSource` shape: deduped by URL, capped early to `maxResults`, `truncated: false` (the web service owns the final flag). `date` / `publishedAt` both feed `publishedAt`; empty fields are omitted. Verified with the shipped build:

```js
import { mapTinyFishResponse } from 'dsh-tinyfish-search'

const out = mapTinyFishResponse({
  query: 'TinyFish docs',
  results: [
    { position: 1, site_name: 'TinyFish', title: 'Search API', snippet: 'One GET per query.', url: 'https://docs.tinyfish.ai/search-api', date: '2026-09-01' },
    { position: 2, title: 'dup', url: 'https://docs.tinyfish.ai/search-api' },
  ],
}, 5)
console.log(JSON.stringify(out, null, 2))
```

```json
{
  "sources": [
    {
      "url": "https://docs.tinyfish.ai/search-api",
      "title": "Search API",
      "snippet": "One GET per query.",
      "publishedAt": "2026-09-01"
    }
  ],
  "truncated": false
}
```

The duplicate URL is dropped; the second item adds nothing new.

### 4.3 Geo / language targeting

```yaml
- id: dsh-tinyfish-search
  config:
    location: US
    language: en
```

sends `?query=...&location=US&language=en` (verified). Blank or unset values send nothing — the default wire format carries just `query`.

---

## 5. Errors and cancellation

| Code | When | What to do |
|---|---|---|
| `WEB_PROVIDER_CREDENTIAL_MISSING` | No key from any source | Set `TINYFISH_API_KEY`, store it via the credentials service, or set literal `apiKey` |
| `WEB_PROVIDER_ERROR` | HTTP error or unprocessable body (TinyFish message preserved) | Check the key, endpoint, and network |
| `WEB_ABORTED` | Caller cancelled the search | Retry if still needed |

The missing-key message names the configured variable (verified):

```text
dsh-tinyfish-search has no API key for "TINYFISH_API_KEY"; set the environment variable, store it through the credentials service, or set a literal "apiKey" in the dsh-tinyfish-search config
```

A malformed TinyFish response (non-array `results`, items without a string `url`) degrades to zero sources rather than throwing.
