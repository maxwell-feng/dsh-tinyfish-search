# dsh-tinyfish-search

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/README.zh.md)

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that runs the built-in `web_search` tool on the [TinyFish Search API](https://docs.tinyfish.ai/search-api). One GET per query. No model call.

## What it does

The plugin registers a web search provider on `ctx.web` under the stable id `tinyfish`:

- Each `web_search` call becomes `GET https://api.search.tinyfish.ai` with the `x-api-key` header.
- `results[]` (title, snippet, URL, date) are mapped to `WebSearchSource`.
- `ready(llmProvider)` reports whether a usable API key exists. Without one, a model step is not offered `web_search`.
- No LLM turn is consumed per search.
- Native `icon.svg` and bilingual manifest resources (`locale/en.json`, `locale/zh.json`) are included for Plugin Manager.

## Bundle patch

`cordis.patch.yml` overrides two host rows:

- `web`: sets `searchProvider: tinyfish` and restates `fetchProvider: http`. `dsh-base` pins this row to `deepseek-search-api` by default, so the patch is what routes searches to TinyFish.
- `tool-web`: re-enables the host tool row with `disabled: false` and restates `search: true`, `fetch: true` and the base timeouts. `dsh-web-app` ships this row disabled, so a clean web profile would otherwise have no `web_search` tool.

Re-enabling `tool-web` makes the web tools visible to every agent preset on the profile, including presets that do not otherwise carry them (e.g. `minimal`). A preset that mounts its own `tool-web` row shadows this registration for its agents. To scope the tools to one preset, override or remove the `tool-web` row in your profile `cordis.patch.yml` and add `tool-web` to that preset's composition. Later profile, home and `--patch` layers can override both rows.

Configuration uses a volatile schema. The Host reads the exported `Config` and renders the form for the `dsh-tinyfish-search` row on the Plugins page. There is no plugin-side settings code. A saved edit reaches the next search without a restart.

## Requirements

- DeepSeek Harness `dsh` with the web seam, such as the `web` profile. Build baseline: `0.2.2-rc.3` (released 2026-11-13). `engines.dsh`: `>=0.1.7-alpha.2 <0.3.0`.
- Node.js `^22.19.0 || >=24.0.0`. DSH 0.2.2 hosts require Node 24.9+, so the effective host floor is 24.9.
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys). Search is free at any wallet balance.
- `@deepseek-ai/dsh-credentials` and `@deepseek-ai/dsh-launch-environment` as peers. Every `dsh` profile carries them.

DSH checks the declared `engines.dsh` range against the running version before it loads the row. A host outside the range is refused with the exact requirement named. To accept the risk:

```sh
dsh plugin allow-version dsh-tinyfish-search@0.21.0 --dsh-version <your-dsh-version> --accept-risk
```

Guides: [Install](INSTALL.md) · [Configuration](CONFIG.md) · [Usage](USAGE.md) · [Update](UPDATE.md) · [Uninstall](UNINSTALL.md) · [Changelog](CHANGELOG.md). Each has a Chinese edition.

## Install

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

From a checkout or tarball:

```sh
dsh plugin --profile web add ./dsh-tinyfish-search
dsh plugin --profile web add ./dsh-tinyfish-search-0.21.0.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

`--profile <name>` goes before `add`, `remove` and `update`. Git installs build `lib/` through the package `prepare` script (`tsc -p tsconfig.build.json`).

Check the layer with `dsh --profile web --dump-config | grep tinyfish`. Then start a session and ask a question that needs live information: the result should carry TinyFish URLs and snippets, and the web search settings card should show provider `tinyfish` with `available: true`.

## Configure

Set the API key (recommended):

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

On Windows PowerShell, use `setx TINYFISH_API_KEY "your_api_key_here"` for new terminals or `$env:TINYFISH_API_KEY = "your_api_key_here"` for the current session.

Set these fields in your profile `cordis.yml` or a patch layer:

| Field | Default | Meaning |
|---|---|---|
| `apiKey` | — | Literal API key (secret; wins over the env var) |
| `apiKeyEnv` | `TINYFISH_API_KEY` | Environment variable carrying the key |
| `baseURL` | `https://api.search.tinyfish.ai` | API endpoint base |
| `location` | — | Optional geo targeting; blank sends nothing |
| `language` | — | Optional search language; blank sends nothing |

All fields are optional. See the [Configuration Guide](CONFIG.md) for the schema, credential order and readiness rules.

## Usage

1. The model calls `web_search` as usual.
2. The harness routes it through `ctx.web` → `tinyfish` → `https://api.search.tinyfish.ai`.
3. Results arrive as `WebSearchSource[]` (`url`, `title`, `snippet`, `publishedAt`).

`available()` is a local check the seam uses to pick a provider. `ready()` decides whether the tool is offered on a model step. With no usable key, `web_search` is withheld. A dispatched search without a key fails with `WEB_PROVIDER_CREDENTIAL_MISSING`.

Errors follow the `dsh-web` seam: `WEB_PROVIDER_CREDENTIAL_MISSING` when no key is found, `WEB_ABORTED` on cancellation, `WEB_PROVIDER_ERROR` otherwise. See the [Usage Guide](USAGE.md) for examples and the error table.

## Update

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
```

The current release is a dependency-only update. See the [Update Guide](UPDATE.md) for steps and rollback.

## Uninstall

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

This removes the bundle layer and the `tinyfish` provider. The `web` and `tool-web` rows return to the values shipped by the underlying bundles. Restart the profile to confirm `web_search` falls back to `deepseek-search-api` (the 0.2.2 default; `deepseek-official` on earlier hosts) or to no provider if none is installed.

## Development

Maintained with the assistance of dsh-superagent.

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test, mocked fetch
pnpm typecheck # tsc --noEmit, src + test + scripts
```

Run `node scripts/check-docs-language.ts` to check the docs language pairs. Publishing uses npm Trusted Publishing (OIDC) through GitHub Actions; see [`.github/workflows/publish.yml`](./.github/workflows/publish.yml).

Release notes: [CHANGELOG.md](./CHANGELOG.md) or [CHANGELOG.zh.md](./CHANGELOG.zh.md), plus the [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) page.

## License

MIT — see [LICENSE](./LICENSE).
