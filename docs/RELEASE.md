# Release notes — v0.23.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-11-24

**dsh-tinyfish-search** 0.23.0 aligns the plugin with DeepSeek Harness `0.2.3-alpha.2` (released 2026-11-22). This is a dependency, Node.js requirement and documentation release: the API, configuration fields and normal search behavior are unchanged. `mapTinyFishResponse` now degrades a null payload or null result item to zero sources instead of throwing.

## Changes

- Every `@deepseek-ai/dsh-*` devDependency moves from `0.2.2-rc.5` to `0.2.3-alpha.2`.
- `@deepseek-ai/cordis` moves to `4.2.0-alpha.1` and `@deepseek-ai/schemastery` to `3.20.0-alpha.1`; the peer and dependency ranges admit the 0.2.3 line while still admitting earlier 0.2.x hosts.
- `engines.node` now matches DSH 0.2.3: `^24.22.3 || >=26.13.1`. The CI and publish jobs pin Node.js to 24.22.3.
- `USER_AGENT` is bumped to `dsh-tinyfish-search/0.23.0`, and its test assertion is updated.
- `engines.dsh` remains `>=0.1.7-alpha.2 <0.3.0`.
- The lockfile and workspace supply-chain exemptions are refreshed for the `0.2.3-alpha.2` package set.

## Documentation

- README, INSTALL, CONFIG, UPDATE, USAGE, UNINSTALL and both release notes now state plugin version `0.23.0`, the `0.2.3-alpha.2` baseline and the Node.js floor where relevant.
- The TinyFish Plugin Manager title now uses sentence case, and both locale descriptions state the API-key requirement.
- Corrected Chinese word order in the bundle-patch explanation, the web-seam reference and the Node.js floor sentences; aligned the `bundle layer`, credential-order and first-non-empty-value wording with the English guides.
- Replaced the stale "Settings → Web Search" / "`available: true`" verification with the 0.2.3 UI path **Plugins → Web search and fetch** and the provider's registered title; documented all three patch rows.
- CONFIG, USAGE and UNINSTALL now carry the current plugin version and baseline; the Chinese changelog no longer uses a different separator style from the English one.

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

The API and configuration are unchanged. A 0.2.2 host on Node.js 24.9 can stay on 0.22.0; install 0.23.0 after moving to DSH 0.2.3-alpha.2 or to a host that meets the new Node.js floor.
