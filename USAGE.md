# Usage Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/USAGE.zh.md)

## How a search flows

In a session on a profile that composes this bundle, the model calls `web_search` as usual. The harness routes the call through the web seam to this plugin:

```text
model → web_search → ctx.web → tinyfish → GET https://api.search.tinyfish.ai
```

One search is one HTTP request:

```text
GET https://api.search.tinyfish.ai/?query=hello+world&location=US&language=en
x-api-key: <your TinyFish key>
user-agent: dsh-tinyfish-search/0.21.0
accept: application/json
```

`location` and `language` are sent only when configured. Otherwise the request carries just `query`. No model call is consumed per search.

## Providers

The bundle patch composes two rows:

| Row | Effect |
|---|---|
| `web` | Points the seam at this provider: `searchProvider: tinyfish` (`fetchProvider: http` restated) |
| `tool-web` | Re-enables the host model-facing tools: `disabled: false`, `search: true`, `fetch: true`, timeouts restated |

The provider registers under the stable id `tinyfish` (`TINYFISH_PROVIDER_ID`). Its configuration form is keyed by the profile row id `dsh-tinyfish-search`; DSH derives the namespace from the row.

`available()` is a local check: a key is present or resolvable, and `baseURL` parses. It makes no network calls. A provider with a credential resolver counts as usable even before the key exists, so a missing key surfaces at search time as `WEB_PROVIDER_CREDENTIAL_MISSING` rather than as "unavailable".

Since DeepSeek Harness 0.2.2 the provider also implements `ready(llmProvider)`. It answers whether a search for a model request on that chat route has a credential to send. `dsh-tool-web` uses it as the activation condition of `web_search`, so with no usable credential the model step is not offered the tool and a missing key never becomes a failed call. Like `available()`, it is configuration only and contacts nothing. Unlike `available()`, it resolves the key and answers `false` when nothing comes back. TinyFish uses one key on every model route, so `llmProvider` never changes the answer.

Per-preset scoping: the host `tool-web` row makes the tools visible to every agent preset on the profile. A preset that mounts its own `tool-web` row shadows the global registration for its agents. To scope the tools to one preset, override or remove the `tool-web` row in the profile `cordis.patch.yml` and add `tool-web` to that preset's composition.

## Credential configuration

The API key resolves in this order per search; the first non-empty value wins:

1. Literal `apiKey` in the plugin config (secret role; avoid committing it).
2. The credentials service: `ctx.credentials.resolve(apiKeyEnv)`.
3. The launch environment: `launchEnvironmentOf(ctx).get(apiKeyEnv)`.
4. `process.env[apiKeyEnv]`, for standalone use outside the host.

`apiKeyEnv` defaults to `TINYFISH_API_KEY` and carries the `credential-ref` role, so the rendered form shows the credential reference. A committed form edit reaches the next search without a restart.

Recommended setup with the environment variable only:

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

On Windows PowerShell, use `setx TINYFISH_API_KEY "your_api_key_here"` for new terminals or `$env:TINYFISH_API_KEY = "your_api_key_here"` for the current session.

## Examples

### In-session search

```text
What is today's weather in Tokyo?
```

The model calls `web_search`, the harness routes it to TinyFish, and the tool result carries normalized sources. In the GUI, **Settings → Web Search** shows provider `tinyfish` with `available: true` once the key is configured.

### Normalized result shape

`results[]` items map to the seam's `WebSearchSource` shape, deduplicated by URL and capped early to `maxResults`. `truncated` is `false` because the web service owns the final flag. `date` and `publishedAt` both feed `publishedAt`; empty fields are omitted.

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

The duplicate URL is dropped. TinyFish returns no long-form summary and no generated answer, so the plugin fills neither `WebSearchSource.summary` nor `WebSearchResult.content`. Both are optional on the seam.

### Geo and language targeting

```yaml
- id: dsh-tinyfish-search
  config:
    location: US
    language: en
```

This sends `?query=...&location=US&language=en`. Blank or unset values send nothing.

## Errors and cancellation

| Code | When | What to do |
|---|---|---|
| `WEB_PROVIDER_CREDENTIAL_MISSING` | No key from any source | Set `TINYFISH_API_KEY`, store the key through the credentials service, or set a literal `apiKey` |
| `WEB_PROVIDER_ERROR` | HTTP error or unprocessable body; the TinyFish message is preserved | Check the key, endpoint and network |
| `WEB_ABORTED` | The caller cancelled the search | Retry if still needed |

The missing-key message names the configured variable: `dsh-tinyfish-search has no API key for "TINYFISH_API_KEY"; set the environment variable, store it through the credentials service, or set a literal "apiKey" in the dsh-tinyfish-search config`.

A malformed TinyFish response (non-array `results`, items without a string `url`) degrades to zero sources instead of throwing.

`WEB_PROVIDER_CREDENTIAL_MISSING` comes from a dispatched search. On the normal model path, `ready()` withholds the tool first, so this error usually appears only for programmatic callers that bypass the gate.
