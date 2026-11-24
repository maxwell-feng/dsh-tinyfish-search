# Usage Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/USAGE.zh.md)

Current plugin version: `0.23.0`. Build baseline: DeepSeek Harness `0.2.3-alpha.2`; Node.js `^24.22.3 || >=26.13.1`.

## How a search flows

On a profile composing this bundle, the model calls `web_search`; the harness routes it through the web seam to this plugin:

```text
model → web_search → ctx.web → tinyfish → GET https://api.search.tinyfish.ai
```

One search is one HTTP request:

```text
GET https://api.search.tinyfish.ai/?query=hello+world&location=US&language=en
x-api-key: <your TinyFish key>
user-agent: dsh-tinyfish-search/0.23.0
accept: application/json
```

`location` and `language` are sent only when configured; otherwise the request carries only `query`. No model call per search.

## Providers

The bundle patch composes three rows: the plugin row plus two host-row overrides.

| Row | Effect |
|---|---|
| `dsh-tinyfish-search` | Inserts the plugin row and registers the `tinyfish` provider |
| `web` | Points the seam at this provider: `searchProvider: tinyfish` (`fetchProvider: http` restated) |
| `tool-web` | Re-enables the host model-facing tools: `disabled: false`, `search: true`, `fetch: true`, timeouts restated |

The provider registers as `tinyfish` (`TINYFISH_PROVIDER_ID`); its form is keyed by the profile row id `dsh-tinyfish-search`, from which DSH derives the namespace.

`available()` is a local check: a literal key is present or a credential resolver is configured, and `baseURL` parses; it makes no network calls. A provider with a resolver counts as selectable before the key exists, so a missing key surfaces at search time as `WEB_PROVIDER_CREDENTIAL_MISSING`, not as "unavailable".

Since DSH 0.2.2 the provider implements `ready(llmProvider)`, which reports whether a search for a model request on that chat route has a configured credential. `dsh-tool-web` uses it to activate `web_search`: with no configured credential, the model step gets no tool, so a missing key never becomes a failed call. It checks configuration only and resolves the key; if none comes back it answers `false`. TinyFish uses one key on every route, so `llmProvider` never changes the answer.

The host `tool-web` row exposes the tools to every agent preset; a preset with its own `tool-web` row shadows that registration. To scope to one preset, override or remove the row in the profile `cordis.patch.yml` and add `tool-web` to its composition.

## Credential configuration

The API key resolves in this order per search; the first non-empty value wins:

1. Literal `apiKey` in the plugin config (secret role; avoid committing it).
2. The credentials service: `ctx.credentials.resolve(apiKeyEnv)`.
3. The launch environment: `launchEnvironmentOf(ctx).get(apiKeyEnv)`.
4. `process.env[apiKeyEnv]`, for standalone use outside the host.

`apiKeyEnv` defaults to `TINYFISH_API_KEY` with the `credential-ref` role, so the form shows the credential reference. A committed edit reaches the next search without a restart.

Recommended: environment variable only:

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

Windows PowerShell: use `setx TINYFISH_API_KEY "your_api_key_here"` for new terminals or `$env:TINYFISH_API_KEY = "your_api_key_here"` for the current session.

## Examples

### In-session search

```text
What is today's weather in Tokyo?
```

The model calls `web_search`; the harness routes it to TinyFish and returns normalized sources. In the GUI, open **Plugins → Built-in plugin settings → Web search and fetch**; the **Web search provider** menu lists **TinyFish Search** (id `tinyfish`).

### Normalized result shape

`results[]` maps to `WebSearchSource`, deduplicated by URL and capped to `maxResults`. `truncated` is `false` because the web seam sets it. `date` and `publishedAt` both feed `publishedAt`; empty fields are omitted.

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
{"sources": [{"url": "https://docs.tinyfish.ai/search-api", "title": "Search API", "snippet": "One GET per query.", "publishedAt": "2026-09-01"}], "truncated": false}
```

The duplicate URL is dropped. TinyFish returns no long-form summary or generated answer, so the plugin fills neither `WebSearchSource.summary` nor `WebSearchResult.content`; both are optional.

### Geo and language targeting

```yaml
- id: dsh-tinyfish-search
  config:
    location: US
    language: en
```

This sends `?query=...&location=US&language=en`; blank or unset values send nothing.

## Errors and cancellation

| Code | When | What to do |
|---|---|---|
| `WEB_PROVIDER_CREDENTIAL_MISSING` | No key from any source | Set `TINYFISH_API_KEY`, store the key through the credentials service, or set a literal `apiKey` |
| `WEB_PROVIDER_ERROR` | HTTP error, or a success body that cannot be parsed; the upstream message is preserved for HTTP errors | Check the key, endpoint and network |
| `WEB_ABORTED` | The caller cancelled the search | Retry if still needed |

The missing-key message names the configured variable: `dsh-tinyfish-search has no API key for "TINYFISH_API_KEY"; set the environment variable, store it through the credentials service, or set a literal "apiKey" in the dsh-tinyfish-search config`.

A malformed TinyFish response (non-array `results`, items without a string `url`) degrades to zero sources instead of throwing.

`WEB_PROVIDER_CREDENTIAL_MISSING` comes from a dispatched search; normally `ready()` withholds the tool first, so it usually appears only for programmatic callers bypassing the gate.
