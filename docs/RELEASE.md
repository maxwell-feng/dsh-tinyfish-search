# Release notes — v0.14.0

English | [Chinese](RELEASE.zh.md)

Release date: 2026-09-29

**dsh-tinyfish-search** 0.14.0 aligns the plugin with DeepSeek Harness 0.2.0-rc.2, the current release of the plugin-development documentation this plugin follows. No runtime code, no configuration and no tool surface changed, so the plugin behaves exactly as 0.13.0. This is a re-verification release, not a forced upgrade: because 0.13.0 already declared the widened peer range, it is admitted on 0.2.0-rc.2 as well.

## Changed

- **Harness alignment.** Development dependencies move to DeepSeek Harness 0.2.0-rc.2, and this release is verified against it.
- **Peer ranges stay `>=0.1.7-alpha.2 <0.3.0`.** DeepSeek Harness 0.2.0-rc.2 verifies every `@deepseek-ai/dsh*` peer range against the running runtime before it admits a row, and prereleases participate in range matching. The range 0.14.0 declares is the one 0.13.0 already introduced, so `0.13.0` is admitted on `0.2.0-rc.2` too. The release still refused there is the narrow-range `0.12.0`, whose `^0.1.7-alpha.2` peers exclude `0.2.x`. `engines.dsh` carries the same range; the Node engine range is unchanged.
- **Seam audit.** Every interface this plugin uses is identical in the 0.2.0-rc.1 and 0.2.0-rc.2 sources: the web search-provider seam, the credential resolver, the volatile configuration schema the Host reads, and the launch-environment lookup. The 0.2.0-rc.2 delta is additive — Cordis Inspect diagnostics, `TypertGateway.hasLiveClient()`, and timed user questions — and touches none of them.
- **Source change.** Exactly one line of plugin source moved: the `USER_AGENT` version constant.
- **Supply-chain gate.** The workspace file now exempts the 0.2.0-rc.2 package set from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases.
- **Documentation.** The install, update, configuration, usage and uninstall guides carry the 0.14.0 banners and commands in both languages.
- **Bilingual proofread.** Five Chinese-only defects were corrected, and all eight document pairs were re-checked for section order, numbering, list order and table alignment — no ordering defect remained.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.14.0`, or let the profile track the latest release. No manual steps: no configuration field, value or default changed. This is not a mandatory upgrade — `0.13.0` already loads on DeepSeek Harness 0.2.0-rc.2. Users still on the narrow-range `0.12.0` must move forward, because that release is refused on `0.2.0-rc.2`; `dsh plugin allow-version` is only a risk-acknowledging override, not a compatibility fix. See CHANGELOG.md for the full history.

## Verification

- Type check and build are clean, and all 22 unit tests pass against DeepSeek Harness 0.2.0-rc.2 packages.
- The harness's own published `evaluatePluginCompatibility` (`@deepseek-ai/dsh-app-boot@0.2.0-rc.2`) reports runtime `0.2.0-rc.2`, admits `dsh-tinyfish-search@0.14.0` on `0.2.0-rc.2`, `0.2.0-rc.1`, `0.2.0`, `0.1.7-rc.2` and `0.1.7-alpha.2`, and refuses `dsh-tinyfish-search@0.12.0` on `0.2.0-rc.2` over its `^0.1.7-alpha.2` peers.
- `dsh-tinyfish-search@0.13.0`, with the same peers it shipped, is admitted on `0.2.0-rc.2` — the measurement behind "not a forced upgrade".
