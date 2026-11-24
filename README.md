# dsh-tinyfish-search

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/README.zh.md)

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin for the [TinyFish Search API](https://docs.tinyfish.ai/search-api): runs the built-in `web_search` tool, one GET per query, no model call.

## What it does

The plugin registers a web search provider on `ctx.web` as `tinyfish`:

- Each `web_search` call is a `GET https://api.search.tinyfish.ai` with `x-api-key`.
- `results[]` (title, snippet, URL, date) map to `WebSearchSource`.
- `ready(llmProvider)` reports whether an API key is configured; without one, the model step gets no `web_search`.
- No LLM turn is consumed per search.
- Bundled `icon.svg` and locale files (`locale/en.json`, `locale/zh.json`) serve Plugin Manager.

## Bundle patch

`cordis.patch.yml` overrides two host rows:

- `web`: sets `searchProvider: tinyfish` and restates `fetchProvider: http`. Since DSH 0.2.2-rc.5, `dsh-base` sets no search provider; `dsh-web` picks per route (legacy Messages search on DeepSeek, DeepSeek Search API elsewhere). The id pins TinyFish everywhere.
- `tool-web`: re-enables the host tool row with `disabled: false`, `search: true`, `fetch: true` and the base timeouts. `dsh-web-app` ships it disabled; a clean web profile otherwise lacks `web_search`.

Re-enabling `tool-web` exposes the web tools to every agent preset, including ones that otherwise lack them (e.g. `minimal`). A preset's own `tool-web` row shadows this registration for its agents. To scope to one preset, override or remove that row in the profile `cordis.patch.yml` and add `tool-web` to the preset's composition; later profile, home and `--patch` layers can override both.

Configuration uses a volatile schema: the Host reads `Config` and renders the `dsh-tinyfish-search` form on the Plugins page. There is no plugin-side settings code; saved edits reach the next search without a restart.

## Requirements

- DeepSeek Harness `dsh` with the web seam (e.g. the `web` profile). Build baseline: `0.2.3-alpha.2` (2026-11-22). `engines.dsh`: `>=0.1.7-alpha.2 <0.3.0`.
- Node.js `^24.22.3 || >=26.13.1`; DSH 0.2.3 needs 24.22.3+ on 24.x or 26.13.1+.
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys). Search is free at any wallet balance.
- `@deepseek-ai/dsh-credentials` and `@deepseek-ai/dsh-launch-environment` as peers; every `dsh` profile carries them.

DSH checks `engines.dsh` before loading the row; an outside host is refused with the exact requirement. To accept the risk:

```sh
dsh plugin --profile web allow-version dsh-tinyfish-search@0.23.0 --dsh-version <your-dsh-version> --accept-risk
```

Guides: [Install](INSTALL.md) · [Configuration](CONFIG.md) · [Usage](USAGE.md) · [Update](UPDATE.md) · [Uninstall](UNINSTALL.md) · [Changelog](CHANGELOG.md); each has a Chinese edition.

## Install

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

From a checkout or locally built tarball (`npm pack` writes the `.tgz`):

```sh
dsh plugin --profile web add ./dsh-tinyfish-search
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

`--profile <name>` goes before `add`, `remove`, `update` and `allow-version`. Git installs build `lib/` via `prepare` (`tsc -p tsconfig.build.json`).

Check the layer with `dsh --profile web --dump-config | grep tinyfish`. Then open **Plugins → Built-in plugin settings → Web search and fetch**; the **Web search provider** menu should list **TinyFish Search** (id `tinyfish`). A live search should return TinyFish URLs and snippets.

## Configure

Set the API key (recommended):

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

Windows PowerShell: use `setx TINYFISH_API_KEY "your_api_key_here"` for new terminals, or `$env:TINYFISH_API_KEY = "your_api_key_here"` for the current session.

Set these fields in your profile `cordis.yml` or a patch layer:

| Field | Default | Meaning |
|---|---|---|
| `apiKey` | — | Literal API key (secret; wins over the env var) |
| `apiKeyEnv` | `TINYFISH_API_KEY` | Environment variable carrying the key |
| `baseURL` | `https://api.search.tinyfish.ai` | API endpoint base |
| `location` | — | Optional geo targeting; blank sends nothing |
| `language` | — | Optional search language; blank sends nothing |

All fields are optional; see the [Configuration Guide](CONFIG.md) for schema, credential order and readiness rules.

## Usage

1. The model calls `web_search` as usual.
2. The harness routes it through `ctx.web` → `tinyfish` → `https://api.search.tinyfish.ai`.
3. Results arrive as `WebSearchSource[]` (`url`, `title`, `snippet`, `publishedAt`).

`available()` is the seam's local provider check; `ready()` decides whether a model step gets the tool. Without a configured key, `web_search` is withheld; bypassing the gate yields `WEB_PROVIDER_CREDENTIAL_MISSING`.

Errors follow the `dsh-web` seam: `WEB_PROVIDER_CREDENTIAL_MISSING` when no key is found, `WEB_ABORTED` on cancellation, `WEB_PROVIDER_ERROR` otherwise. See the [Usage Guide](USAGE.md) for examples and the error table.

## Update

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
```

This release moves dependencies to DSH 0.2.3-alpha.2, raises the Node.js floor to match DSH, and updates the docs. Normal search behavior is unchanged; malformed responses are handled more robustly. See the [Update Guide](UPDATE.md) for steps and rollback.

## Uninstall

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

Removing this bundle returns `web` and `tool-web` to the underlying bundles' values and removes the `tinyfish` provider. A preset with its own `tool-web` row keeps `web_search`, falling back to the harness's selection: `deepseek-official` (legacy Messages search) on DeepSeek routes and `deepseek-search-api` elsewhere since 0.2.2-rc.5; `deepseek-search-api` on 0.2.2-rc.2–rc.4; `deepseek-official` earlier; none if no provider is installed. Presets relying on this bundle's host-level `tool-web` row (e.g. `minimal`) lose `web_search` until it is restored.

## Development

Maintained with the assistance of dsh-superagent.

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test, mocked fetch
pnpm typecheck # tsc --noEmit, src + test + scripts
```

Run `node scripts/check-docs-language.ts` to check the docs pairs. Publishing uses npm Trusted Publishing (OIDC) through GitHub Actions; see [`.github/workflows/publish.yml`](./.github/workflows/publish.yml).

Release notes: [CHANGELOG.md](./CHANGELOG.md) or [CHANGELOG.zh.md](./CHANGELOG.zh.md), plus the [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) page.

## License

MIT — see [LICENSE](./LICENSE).
