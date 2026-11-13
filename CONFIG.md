# Configuration Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/CONFIG.zh.md)

## Fields

The plugin exports a `Config` schema built with `@deepseek-ai/schemastery`. The Host reads it and renders the form for the `dsh-tinyfish-search` row on the Plugins page. All fields are optional and `.volatile()`.

| Field | Type | Default | Role | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | Literal API key. Leave empty and prefer `apiKeyEnv` to keep secrets out of config files. |
| `apiKeyEnv` | `string` | `TINYFISH_API_KEY` | `credential-ref` | Environment variable name carrying the API key. |
| `baseURL` | `string` | `https://api.search.tinyfish.ai` | Normal | API endpoint base. Must use `http:` or `https:`. Localhost and private IP ranges are blocked. |
| `location` | `string` | `undefined` | Normal | Optional geo targeting (e.g. `US`, `CN`) forwarded to TinyFish. |
| `language` | `string` | `undefined` | Normal | Optional search language (e.g. `en`, `zh`) forwarded to TinyFish. |

Defaults are declared on the schema, so the rendered form shows the same values the plugin uses.

## How a value reaches a search

DeepSeek Harness 0.1.7 replaced the old settings seam with schema-driven configuration.

- Declaration: `src/config.ts` exports `Config`; `src/index.ts` re-exports it. The Host finds it as `entry.fiber.runtime.Config`. The namespace comes from the profile row id `dsh-tinyfish-search`, not from the plugin.
- One live reference per field: `apply(ctx, config)` receives a `Volatile<T>` for each field. There is no `ctx.inject(['settings'])` and no registration call.
- One snapshot per search: the provider reads `.get()` for all five fields at the start of each search. A single search cannot mix values from before and after a save.
- Writes: the Plugins page form writes through `ctx.configForms.get(entryId)` to a `ConfigForm` (`getSnapshot`, `subscribe`, `set`, `unset`, `mutate`, `dispose`). Writes are revision-fenced; a refusal resolves `false` and reloads Host state.
- Effect: a committed edit reaches the next search without a restart or re-registration.

Programmatic construction accepts a finished `TinyFishOptions`, a snapshot object, or a thunk returning `TinyFishOptions` (`TinyFishProviderInput`). Only the plugin path passes a thunk.

## Recommended setup: environment variable

```sh
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

No YAML change is needed. The plugin resolves the credential on each search.

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

The row `id` is also the key used to address the configuration form. Renaming the row renames the form namespace.

## Web UI

1. Open **Settings** from the sidebar.
2. Go to the **Plugins** page.
3. Open the **`dsh-tinyfish-search`** row to edit values live. A save takes effect without restarting the host.

The form is rendered by the Host from the schema. The plugin supplies no browser code.

## Credential resolution order

Each search resolves the API key from the first non-empty source:

1. Literal `apiKey` in the plugin config.
2. The credentials service: `ctx.credentials.resolve(apiKeyEnv)`.
3. The launch environment: `launchEnvironmentOf(ctx).get(apiKeyEnv)`.
4. `process.env[apiKeyEnv]`, for standalone use outside the host.

A provider with a resolver counts as `available` even before a key is stored. A missing key surfaces at search time as `WEB_PROVIDER_CREDENTIAL_MISSING`, naming the configured variable. See the [Usage Guide](USAGE.md) for the error table.

## Readiness (`ready()`)

DeepSeek Harness 0.2.2 added the optional `ready(llmProvider): Promise<boolean>` member to `WebSearchProvider`. `dsh-tool-web` uses it as the activation condition of `web_search`: a model step whose route answers `false` does not get the tool. The `tinyfish` provider resolves the same chain as the credential order above and reports whether it found a key:

- A literal `apiKey` is ready immediately. Otherwise the resolver runs once.
- A non-empty resolved value means ready. Nothing else does, including an empty string.
- A credential store that throws while being read answers `false`, because the search would fail on the same read.
- The check is configuration only. It never contacts TinyFish and never validates the key, so a wrong-but-present key still counts as ready.
- TinyFish uses the same key on every model route, so `llmProvider` never changes the answer.

`available()` decides whether the seam can select this provider during an operation. `ready()` decides whether the model is offered the tool at all. With no usable credential, `available()` still returns `true` because a resolver exists, while `ready()` returns `false`, so the tool is withheld instead of failing on every call.
