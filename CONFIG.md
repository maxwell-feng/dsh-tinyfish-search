# Configuration Guide

English | [简体中文](CONFIG.zh.md)

This document describes all configuration options, schema validation rules, environment variable overrides, and bundle layer settings for `dsh-tinyfish-search`.

---

## 1. Configuration Fields

The `Config` exported by the plugin is validated at runtime with `@deepseek-ai/schemastery`. All fields are optional.

| Field | Type | Default | Sensitivity | Description |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | Literal TinyFish API Key. **Leave empty** and prefer `apiKeyEnv` to prevent committing secrets to disk. |
| `apiKeyEnv` | `string` | `"TINYFISH_API_KEY"` | `credential-ref` | Environment variable name carrying the TinyFish API Key. |
| `baseURL` | `string` | `"https://api.search.tinyfish.ai"` | Normal | TinyFish Search API root endpoint. |
| `location` | `string` | `undefined` | Normal | Optional geo location targeting (e.g. `"US"`, `"CN"`) forwarded to TinyFish. |
| `language` | `string` | `undefined` | Normal | Optional search language (e.g. `"en"`, `"zh"`) forwarded to TinyFish. |

---

## 2. Recommended Setup (Environment Variable)

Set the API key in your operating system environment:

```bash
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

No YAML modification is needed; the plugin resolves credentials automatically on boot.

---

## 3. Static Profile Configuration (`cordis.patch.yml`)

To customize endpoint or targeting options, add an override in `$DSH_HOME/profiles/<profile>/cordis.patch.yml`:

```yaml
- id: dsh-tinyfish-search
  config:
    apiKeyEnv: TINYFISH_API_KEY
    baseURL: https://api.search.tinyfish.ai
    location: US
    language: en
```

---

## 4. Runtime Web UI Configuration

In the DeepSeek Harness Web UI:
1. Open **Settings** from the sidebar.
2. Navigate to the **Plugins** page.
3. Locate the **`dsh-tinyfish-search`** card to edit configuration live without restarting the host.
