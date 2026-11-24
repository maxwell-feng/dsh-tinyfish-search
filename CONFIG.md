# Configuration Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/CONFIG.zh.md)

Current plugin version: `0.23.0`. Build baseline: DeepSeek Harness `0.2.3-alpha.2`; Node.js `^24.22.3 || >=26.13.1`.

## Fields

The plugin exports a `Config` schema built with `@deepseek-ai/schemastery`. The Host renders the `dsh-tinyfish-search` form from it on the Plugins page. All fields are optional and `.volatile()`.

| Field | Type | Default | Role | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | Literal API key. Leave empty and prefer `apiKeyEnv` to keep secrets out of config files. |
| `apiKeyEnv` | `string` | `TINYFISH_API_KEY` | `credential-ref` | Environment variable name carrying the API key. |
| `baseURL` | `string` | `https://api.search.tinyfish.ai` | Normal | API endpoint base. Must use `http:` or `https:`. Localhost and private IP ranges are blocked. |
| `location` | `string` | `undefined` | Normal | Optional geo targeting (e.g. `US`, `CN`) forwarded to TinyFish. |
| `language` | `string` | `undefined` | Normal | Optional search language (e.g. `en`, `zh`) forwarded to TinyFish. |

Defaults live on the schema, so the form shows the plugin values.

## How a value reaches a search

DSH 0.1.7 replaced the old settings seam with schema-driven config.

Declaration: `src/config.ts` exports `Config`; `src/index.ts` re-exports it. The Host finds `entry.fiber.runtime.Config`; the namespace is the profile row id `dsh-tinyfish-search`, not the plugin.
Live reference per field: `apply(ctx, config)` receives a `Volatile<T>` per field. No `ctx.inject(['settings'])` or registration call.
Snapshot per search: the provider reads `.get()` for all five fields at search start, so one search cannot mix values from before and after a save.
Writes: the Plugins form writes through `ctx.configForms.get(entryId)` to a `ConfigForm` (`getSnapshot`, `subscribe`, `set`, `unset`, `mutate`, `dispose`). Writes are revision-fenced; a refusal returns `false` and reloads Host state.
- Effect: a committed edit reaches the next search without a restart or re-registration.

Programmatic construction accepts a finished `TinyFishOptions`, a snapshot object or a `TinyFishOptions` thunk (`TinyFishProviderInput`); only the plugin path passes a thunk.

## Recommended setup: environment variable

```sh
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

No YAML change needed; the plugin resolves the credential per search.

## Static profile configuration

Add an override in `$DSH_HOME/profiles/<profile>/cordis.patch.yml`:

```yaml
- id: dsh-tinyfish-search
  config:
    apiKeyEnv: TINYFISH_API_KEY
    baseURL: https://api.search.tinyfish.ai
    location: US
    language: en
```

The row `id` addresses the configuration form; renaming the row renames its namespace.

## Web UI

1. Open **Plugins** from the sidebar.
Open the **TinyFish web search** bundle, then its **`dsh-tinyfish-search`** row. Saves take effect without restarting.

The Host renders the form from the schema; the plugin supplies no browser code.

## Credential resolution order

Each search resolves the API key from the first non-empty source:

1. Literal `apiKey` in the plugin config.
2. The credentials service: `ctx.credentials.resolve(apiKeyEnv)`.
3. The launch environment: `launchEnvironmentOf(ctx).get(apiKeyEnv)`.
4. `process.env[apiKeyEnv]`, for standalone use outside the host.

A provider with a resolver counts as `available` before a key is stored; a missing key surfaces at search time as `WEB_PROVIDER_CREDENTIAL_MISSING`, naming the configured variable. See [Usage Guide](USAGE.md) for the error table.

## Readiness (`ready()`)

DeepSeek Harness 0.2.2 added optional `ready(llmProvider): Promise<boolean>` to `WebSearchProvider`. `dsh-tool-web` uses it to activate `web_search`: a model step whose `ready()` returns `false` gets no tool. `tinyfish` resolves the chain above and reports whether it found a key:

- A literal `apiKey` is ready immediately. Otherwise the resolver runs once.
A non-empty resolved value means ready; an empty string and all else do not.
A credential store that throws while read answers `false`, since the search would fail on the same read.
The check is configuration only: it never contacts TinyFish or validates the key, so a wrong-but-present key still counts as ready.
TinyFish uses one key on every route, so `llmProvider` never changes the answer.

`available()` decides whether the web seam can select this provider; `ready()` decides whether the model is offered the tool. With no configured credential, `available()` returns `true` because a resolver exists, while `ready()` returns `false`, so the tool is withheld instead of failing on every call.
