# Release notes — v0.16.0

English | [Chinese](RELEASE.zh.md)

Release date: 2026-10-16

**dsh-tinyfish-search** 0.16.0 aligns the plugin with DeepSeek Harness 0.2.1-alpha.4, the latest release of the plugin-development documentation this plugin follows. No provider logic changed: the `ctx.web` search-provider contract is source-identical between 0.2.1-alpha.2 and 0.2.1-alpha.4, so only the pinned development dependencies, the lockfile, the workspace supply-chain exemption and the `USER_AGENT` version string moved.

## Changed

- **Harness alignment.** Every `@deepseek-ai/dsh-*` devDependency moves from DeepSeek Harness 0.2.1-alpha.2 to 0.2.1-alpha.4, and the lockfile is regenerated against 0.2.1-alpha.4. `@deepseek-ai/cordis` stays `^4.0.4` and `@deepseek-ai/schemastery` stays `^3.18.4`.
- **Supply-chain exemption rebuilt.** The workspace file exempts the 0.2.1-alpha.4 package set from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases. The previous list also carried a second `minimumReleaseAgeExclude` key whose stale `0.2.0-rc.2` entries made pnpm reject the regenerated lockfile; the list is now a single lockfile-derived block.
- **User-Agent attribution.** The `USER_AGENT` constant now reads `dsh-tinyfish-search/0.16.0`.
- **Peer ranges compatibility.** Maintained at `>=0.1.7-alpha.2 <0.3.0`. The plugin remains admitted on runtime versions 0.1.7, 0.2.0 and 0.2.1-alpha.4 without manual exemptions.
- **Source change.** Beyond the `USER_AGENT` version string, none. `registerSearchProvider`, `WebSearchProvider`, `WebSearchRequest`, `WebSearchResult` and `WebError` are unchanged, so no configuration field moved and no request shape changed.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.16.0`, or let the profile track the latest release. No manual steps: no configuration field, value or default changed. This is not a mandatory upgrade — `0.15.0` already loads on DeepSeek Harness 0.2.1-alpha.4.

## Verification

- Type check and build are clean, and all **22** unit tests pass against DeepSeek Harness 0.2.1-alpha.4 packages.
- `node scripts/check-docs-language.ts` passing clean with zero findings across all document pairs.
- Not verified: a live boot into a real 0.2.1-alpha.4 profile, and a live TinyFish API request (the suite stubs `fetch`).
