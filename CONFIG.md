# Configuration Guide

English | [Chinese](CONFIG.zh.md)

> Verified against DeepSeek Harness **0.1.7-rc.2** with `dsh-tinyfish-search` **0.12.0**.

This document describes all configuration options, schema validation rules, how a value reaches a search, SSRF security defenses, environment variable overrides, and bundle layer settings for `dsh-tinyfish-search`.

---

## 1. Configuration Fields

The plugin exports a `Config` schema built with `@deepseek-ai/schemastery`; the Host reads that schema from the plugin entry module and serves it as this entry's configuration form. Every field is marked `.volatile()`, so a validated config carries one live reference per field instead of a frozen value. All fields are optional.

| Field | Type | Default | Sensitivity | Description |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | Literal TinyFish API Key. **Leave empty** and prefer `apiKeyEnv` to prevent committing secrets to disk. |
| `apiKeyEnv` | `string` | `"TINYFISH_API_KEY"` | `credential-ref` | Environment variable name carrying the TinyFish API Key. |
| `baseURL` | `string` | `"https://api.search.tinyfish.ai"` | Normal | TinyFish Search API root endpoint. Must use `http:` or `https:`. Requests to `localhost` or private IP ranges are blocked by SSRF defense. |
| `location` | `string` | `undefined` | Normal | Optional geo location targeting (e.g. `"US"`, `"CN"`) forwarded to TinyFish. |
| `language` | `string` | `undefined` | Normal | Optional search language (e.g. `"en"`, `"zh"`) forwarded to TinyFish. |

Defaults live on the schema, not only at the use site: the rendered form shows what the schema carries, so every default this plugin relies on is declared here.

---

## 2. How a Value Reaches a Search (DSH 0.1.7 Config Model)

DeepSeek Harness 0.1.7 replaced both halves of the old settings seam — the host-side `ctx.settings.installSection` registration and the client-side `SettingsScope` — with schema-driven configuration. For this plugin that means:

- **Declaration**: `src/config.ts` exports `Config` and `src/index.ts` re-exports it. The Host discovers it as `entry.fiber.runtime.Config`. The namespace is derived from the profile row id — `dsh-tinyfish-search` in `cordis.patch.yml` — never chosen by the plugin.
- **One live reference per field**: because each field is `.volatile()`, `apply(ctx, config)` receives a `Volatile<T>` per field. The plugin has no `ctx.inject(['settings'])` and makes no registration call.
- **One snapshot per operation**: the provider is registered with a thunk that reads `.get()` for all five fields at the start of each search. A single search therefore cannot mix a `baseURL` read before a save with an `apiKeyEnv` read after it, and the provider registration itself never has to be replaced.
- **Writes**: the Plugins page config form writes through `ctx.configForms.get(entryId)` → `ConfigForm` (`getSnapshot` / `subscribe` / `set` / `unset` / `mutate` / `dispose`). Writes are revision-fenced; a Host refusal resolves `false` and reloads Host state rather than guessing.
- **Effect**: a committed edit reaches the next search with no restart and no re-registration.

Programmatic construction accepts three input shapes (`TinyFishProviderInput`): a finished `TinyFishOptions`, a snapshot object that still needs its defaults applied, or a thunk returning `TinyFishOptions`. Only the plugin's own path passes a thunk, which is what makes the per-search snapshot work.

---

## 3. Recommended Setup (Environment Variable)

Set the API key in your operating system environment:

```bash
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

No YAML modification is needed; the plugin resolves credentials on each search.

---

## 4. Static Profile Configuration (`cordis.patch.yml`)

To customize endpoint or targeting options, add an override in `$DSH_HOME/profiles/<profile>/cordis.patch.yml`:

```yaml
- id: dsh-tinyfish-search
  config:
    apiKeyEnv: TINYFISH_API_KEY
    baseURL: https://api.search.tinyfish.ai
    location: US
    language: en
```

The row `id` is the same key the configuration form is addressed by, so a profile that renames the row renames the form with it.

---

## 5. Runtime Web UI Configuration

In the DeepSeek Harness Web UI:
1. Open **Settings** from the sidebar.
2. Navigate to the **Plugins** page.
3. Open the **`dsh-tinyfish-search`** row's configuration form to edit values live, without restarting the host.

The form is the Host-rendered schema form for that entry; there is no plugin-supplied browser half.

---

## 6. Credential Resolution Order

Each search resolves the API key from the first non-empty source (verified against `src/options.ts`):

1. Literal `apiKey` in the plugin config.
2. The credentials service: `ctx.credentials.resolve(apiKeyEnv)`.
3. The launch environment: `launchEnvironmentOf(ctx).get(apiKeyEnv)`.
4. `process.env[apiKeyEnv]` (covers standalone use outside the host).

The provider counts as `available` while a resolver exists, even before the key is stored — a missing key then surfaces at search time as `WEB_PROVIDER_CREDENTIAL_MISSING` naming the configured variable. See the [Usage Guide](USAGE.md) for examples and the full error table.
