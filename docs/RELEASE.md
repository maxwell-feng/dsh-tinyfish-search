# Release notes — v0.23.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-11-24

**dsh-tinyfish-search** 0.23.0 aligns with DeepSeek Harness `0.2.3-alpha.2` (2026-11-22). This dependency, Node.js-requirement and documentation release leaves API, configuration fields and normal search behavior unchanged; `mapTinyFishResponse` now returns zero sources for a null payload or null result item instead of throwing.

## Changes

- Every `@deepseek-ai/dsh-*` devDependency moves from `0.2.2-rc.5` to `0.2.3-alpha.2`.
- `@deepseek-ai/cordis` moves to `4.2.0-alpha.1`, `@deepseek-ai/schemastery` to `3.20.0-alpha.1`; peer and dependency ranges cover the 0.2.3 line and earlier 0.2.x hosts.
- `engines.node` matches DSH 0.2.3: `^24.22.3 || >=26.13.1`. CI and publish jobs pin Node.js to 24.22.3.
- `USER_AGENT` is bumped to `dsh-tinyfish-search/0.23.0`; its test assertion is updated.
- `engines.dsh` remains `>=0.1.7-alpha.2 <0.3.0`.
- Lockfile and workspace supply-chain exemptions are refreshed for the `0.2.3-alpha.2` package set.

## Documentation

- All guides and release notes state version `0.23.0`, the `0.2.3-alpha.2` baseline and the Node.js floor.
- The TinyFish Plugin Manager title uses sentence case; both locale descriptions state the API-key requirement.
- Corrected Chinese word order in the bundle-patch, web-seam and Node.js-floor sentences; aligned `bundle layer`, credential-order and first-non-empty-value wording.
- Replaced the stale "Settings → Web Search" / "`available: true`" check with **Plugins → Web search and fetch** and the provider title; documented the three patch rows.
- CONFIG, USAGE and UNINSTALL now carry the current version and baseline; the Chinese changelog matches the English section structure.

## Verification

- `pnpm typecheck`: clean.
- `pnpm build`: clean against DeepSeek Harness 0.2.3-alpha.2.
- `pnpm test`: 24 tests pass.
- `node scripts/check-docs-language.ts`: clean.
- No live profile boot and no live TinyFish request were performed.

## Upgrade

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.23.0
```

The API and configuration are unchanged. A 0.2.2 host on Node.js 24.9 can stay on 0.22.0; install 0.23.0 after moving to DSH 0.2.3-alpha.2 or a host meeting the new Node.js floor.
