# dsh-tinyfish-search

English | [简体中文](README.zh.md)

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that backs the built-in `web_search` tool with the [TinyFish Search API](https://docs.tinyfish.ai/search-api). One GET per query, no model call — fast and free (TinyFish Search is free at any wallet balance).

## What it does

DeepSeek Harness's built-in `web_search` tool normally runs through the DeepSeek Anthropic-compatible endpoint (`web-search-deepseek`). This plugin registers an alternative **web search provider** on the `ctx.web` capability seam:

- Stable provider id: `tinyfish`
- Every `web_search` call becomes `GET https://api.search.tinyfish.ai?query=...` with the `X-API-Key` header
- `results[]` (title / snippet / url / date) are normalized into the seam's portable source shape
- No LLM turn consumed per search — unlike the Anthropic server-tool approach

Installing the bundle **takes over the built-in `web_search` automatically**: the
bundle patch overrides the `web` seam row (`searchProvider: tinyfish`,
`fetchProvider: http` restated), because `dsh-base` pins the seam to
`deepseek-official` and would otherwise keep the tool on the DeepSeek backend.
It also **re-enables the host-level `tool-web` row** (`disabled: false` plus
`search: true`, `fetch: true` and the base timeouts restated): the
`dsh-web-app` bundle ships that row disabled (the Web app normally composes
web tools per agent preset), so without it the model would see no `web_search`
tool at all on a clean web profile install. **Scope note:** re-enabling the
host row makes the tools visible to *every* agent preset on the profile —
including presets that would not otherwise carry web tools (e.g. `minimal`);
a preset that mounts its own `tool-web` row still shadows this global
registration for its agents. To scope the tools to one preset instead,
override or remove the `tool-web` row in your profile's `cordis.patch.yml`
and add `tool-web` to that preset's agent composition. Later layers (profile
/ home `cordis.patch.yml` / `--patch`) can still override both rows.
Configuration is also exposed as a `dsh-tinyfish-search` settings section
(Plugins settings page): a saved edit reaches the next search without a
restart.

## Requirements

- DeepSeek Harness `dsh` CLI (any profile with the web seam, e.g. `web`) — verified on `0.1.5-rc.2` (latest release)
- Node.js `>=22` (matches the harness engine range)
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys) (free to create; Search is free)
- The harness credential seam and launch environment (`@deepseek-ai/dsh-credentials`, `@deepseek-ai/dsh-launch-environment`) are required peers — every `dsh` profile carries them already

## Documentation

- [Install Guide / 安装说明](INSTALL.md) ([中文版](INSTALL.zh.md))
- [Usage Guide / 使用说明](USAGE.md) ([中文版](USAGE.zh.md))
- [Configuration Guide / 配置说明](CONFIG.md) ([中文版](CONFIG.zh.md))
- [Update Guide / 更新说明](UPDATE.md) ([中文版](UPDATE.zh.md))
- [Uninstall Guide / 卸载说明](UNINSTALL.md) ([中文版](UNINSTALL.zh.md))
- [Changelog / 更新日志](CHANGELOG.md)

## Install

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

or from the repository / a tarball:

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # source checkout
dsh plugin --profile web add ./dsh-tinyfish-search-0.6.1.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git installs fetch sources, not built artifacts: pnpm runs the package's `prepare` script, which builds `lib/` from source. pnpm ≥ 10 requires you to allow the build once (it prints the exact `pnpm-workspace.yaml` snippet).

See the [Install Guide](INSTALL.md) for requirements, all install methods, and verification.

## Configure

Set your API key (recommended — no secret in config files):

**Linux / macOS:**

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

**Windows (PowerShell):**

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # permanent — takes effect in new terminals
$env:TINYFISH_API_KEY = "your_api_key_here"  # current session only
```

Or set fields in your profile's `cordis.yml` / patch layer:

```yaml
- insert:
    - id: dsh-tinyfish-search
      name: dsh-tinyfish-search
      config:
        # apiKey: "literal-key"          # alternative to the env var; avoid committing it
        # apiKeyEnv: TINYFISH_API_KEY     # default
        # baseURL: https://api.search.tinyfish.ai   # default
        # location: US                    # optional geo targeting forwarded to TinyFish
        # language: en                    # optional search language forwarded to TinyFish
```

| Field | Default | Meaning |
|---|---|---|
| `apiKey` | — | Literal TinyFish API key (secret role; wins over the env var) |
| `apiKeyEnv` | `TINYFISH_API_KEY` | Environment variable carrying the API key |
| `baseURL` | `https://api.search.tinyfish.ai` | TinyFish Search API endpoint base |
| `location` | — | Optional geo location forwarded as TinyFish's `location` (e.g. `US`); blank/unset sends nothing |
| `language` | — | Optional search language forwarded as TinyFish's `language` (e.g. `en`); blank/unset sends nothing |

See the [Configuration Guide](CONFIG.md) for the full schema, credential resolution order, and runtime settings UI.

## Verify

```sh
dsh --profile web --dump-config | grep tinyfish   # layer present
```

Inside a session, call `web_search` and check that results carry TinyFish URLs/snippets. The web search settings card in the GUI (`网页搜索`) shows the provider state.

## Usage

After installation, no code changes required. In any session with the `web` profile:

1. The model calls `web_search` as usual (e.g. “search for TinyFish docs”).
2. The harness routes it through `ctx.web → tinyfish → https://api.search.tinyfish.ai`.
3. Results appear as `WebSearchSource[]` (`url` / `title` / `snippet` / `publishedAt`) in the tool result.
4. Check GUI: **Settings → Web Search** shows provider `tinyfish` and `available: true` when the API key is configured.

Abort and error semantics follow the `dsh-web` seam: `WEB_PROVIDER_CREDENTIAL_MISSING` when no key, `WEB_ABORTED` on cancellation, `WEB_PROVIDER_ERROR` otherwise.

See the [Usage Guide](USAGE.md) for providers, credential configuration, worked examples, and the error table.

## Uninstall

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

Removes the bundle layer and the `tinyfish` provider registration, and restores
the composed `web` / `tool-web` rows to exactly what the underlying bundles
ship (an inserted row's override returns to the row's own defaults when the
inserting layer is removed). Restart `dsh --profile web` to confirm
`web_search` falls back to the base `deepseek-official` provider (or none if
no other provider is installed).

## Updating

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
# or from git, to pick up changes before they reach npm:
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

Upgrading to 0.6.1 from ≤ 0.5.0 needs no manual steps: the settings section,
patch rows, and credential reference are all carried by the bundle layer, and
pnpm refreshes the package in place. The user-visible changes are the
manifest declaration (`manifestVersion: 1`, `@deepseek-ai/dsh-*` peers now `^0.1.5-rc.2`, Node `>=22`) and
the `USER_AGENT` attribution (`dsh-tinyfish-search/0.6.1`).

Upgrading to 0.5.0 from ≤ 0.4.0 needs no manual steps: the settings section,
patch rows, and credential reference are all carried by the bundle layer, and
pnpm refreshes the package in place. The only user-visible changes are the
harness floor (`@deepseek-ai/dsh-*` peers now `^0.1.5-rc.1`, Node `>=22`) and
the `USER_AGENT` attribution (`dsh-tinyfish-search/0.5.0`).

Upgrading to 0.3.0 from ≤ 0.2.1 needs no manual steps: the settings section,
patch rows, and credential reference are all carried by the bundle layer, and
pnpm refreshes the package in place. The only user-visible change is the
`web`/`tool-web` row behavior documented above, which stays identical unless
you had already overridden those rows yourself.

## Development

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test (mocked fetch)
```

Publishing to npm runs through GitHub Actions with npm **Trusted Publishing** (OIDC) — see [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) and the [npm docs](https://docs.npmjs.com/trusted-publishers/). Tag `vX.Y.Z` (or dispatch the workflow) to release; provenance is generated automatically.

## Release notes

See [CHANGELOG.md](./CHANGELOG.md) (bilingual) and the [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) page.

## License

MIT — see [LICENSE](./LICENSE).
