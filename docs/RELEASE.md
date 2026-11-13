# Release notes — v0.21.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-11-13

**dsh-tinyfish-search** 0.21.0 aligns the plugin with DeepSeek Harness `0.2.2-rc.3`. This is a dependency-only release: the API, configuration fields and search behavior are unchanged.

## Changes

- Every `@deepseek-ai/dsh-*` devDependency moves from `0.2.2-rc.2` to `0.2.2-rc.3`.
- The lockfile and the workspace supply-chain exemption are refreshed for that package set.
- `USER_AGENT` is bumped to `dsh-tinyfish-search/0.21.0`, and its test assertion is updated.
- `engines.dsh` stays `>=0.1.7-alpha.2 <0.3.0`. The plugin remains compatible with `0.2.2-rc.2` and earlier `0.2.x` releases, so the upgrade is optional.
- DeepSeek Harness 0.2.2-rc.3 has no plugin-facing breaking changes. Its release notes add an experimental DeepSeek chat import plugin and fix Windows desktop updates.

## Verification

- `pnpm test`: 24 tests pass.
- `pnpm typecheck`: clean.
- `pnpm build`: clean against DeepSeek Harness 0.2.2-rc.3.
- No live profile boot was performed.

## Upgrade

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.21.0
```

No configuration changes are needed.
