# Release notes — v0.22.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-11-20

**dsh-tinyfish-search** 0.22.0 aligns the plugin with DeepSeek Harness `0.2.2-rc.5`. This is a dependency and documentation release: the API, configuration fields and search behavior are unchanged.

## Changes

- Every `@deepseek-ai/dsh-*` devDependency moves from `0.2.2-rc.3` to `0.2.2-rc.5`.
- The lockfile and the workspace supply-chain exemption are refreshed for that package set.
- `USER_AGENT` is bumped to `dsh-tinyfish-search/0.22.0`, and its test assertion is updated.
- The documentation now describes the `0.2.2-rc.5` search-provider change: the base composition sets no `searchProvider`, so `dsh-web` selects legacy Messages search on DeepSeek model routes and DeepSeek Search API elsewhere. The bundle patch still sets `searchProvider: tinyfish`, so it continues to override that automatic selection and no search behavior changes.
- The uninstall and update guides now spell out this fallback per host line, including the presets that lose `web_search` with the host-level `tool-web` row. The `allow-version` examples now include the required `--profile`.
- `engines.dsh` stays `>=0.1.7-alpha.2 <0.3.0`. The plugin remains compatible with `0.2.2-rc.4` and earlier `0.2.x` releases, so the upgrade is optional.

## Verification

- `pnpm test`: 24 tests pass.
- `pnpm typecheck`: clean.
- `pnpm build`: clean against DeepSeek Harness 0.2.2-rc.5.
- No live profile boot was performed.

## Upgrade

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.22.0
```

No configuration changes are needed.
