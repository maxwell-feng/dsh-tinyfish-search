# Release notes — v0.17.0

English | [Chinese](RELEASE.zh.md)

Release date: 2026-10-18

**dsh-tinyfish-search** 0.17.0 aligns the plugin with DeepSeek Harness 0.2.1-rc.2, the latest release of the plugin-development documentation this plugin follows. No provider logic changed: the `ctx.web` search-provider contract is declaration-identical between 0.2.1-alpha.4 and 0.2.1-rc.2, so only the pinned development dependencies, the lockfile, the workspace supply-chain exemption and the `USER_AGENT` version string moved.

## Changed

- **Harness alignment.** Every `@deepseek-ai/dsh-*` devDependency moves from DeepSeek Harness 0.2.1-alpha.4 to 0.2.1-rc.2, and the lockfile is regenerated against 0.2.1-rc.2. `@deepseek-ai/cordis` moves to `^4.0.5` and `@deepseek-ai/schemastery` to `^3.18.5`.
- **Supply-chain exemption rebuilt.** The workspace file exempts the 0.2.1-rc.2 package set from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases. The list stays a single lockfile-derived block.
- **User-Agent attribution.** The `USER_AGENT` constant now reads `dsh-tinyfish-search/0.17.0`.
- **Ranges compatibility.** `engines.dsh` and the peers are maintained at `>=0.1.7-alpha.2 <0.3.0`. The plugin remains admitted on runtime versions 0.1.7, 0.2.0 and 0.2.1-rc.2 without manual exemptions.
- **Source change.** Beyond the `USER_AGENT` version string, none. `registerSearchProvider`, `WebSearchProvider`, `WebSearchRequest`, `WebSearchResult` and `WebError` are unchanged, so no configuration field moved and no request shape changed.

## Documentation

- Rewrote the "Harness compatibility gate" section: since DSH `0.2.1-alpha.4`, a package's own `engines.dsh` range decides admission alone and the peers are ignored for that check. Both rules match with prerelease semantics, and a refusal record reports `requirements`.
- Every bilingual document's verification baseline is now `0.2.1-rc.2` / plugin `0.17.0`, and the Chinese README gained the 0.17.0 upgrade paragraph it was missing, so both languages list the same upgrade history.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.17.0`, or let the profile track the latest release. No manual steps: no configuration field, value or default changed. This is not a mandatory upgrade — `0.16.0` already loads on DeepSeek Harness 0.2.1-rc.2.

## Verification

- Type check and build are clean, and all **22** unit tests pass against DeepSeek Harness 0.2.1-rc.2 packages.
- `node scripts/check-docs-language.ts` passing clean with zero findings across all document pairs.
- Not verified: a live boot into a real 0.2.1-rc.2 profile, and a live TinyFish API request (the suite stubs `fetch`).
