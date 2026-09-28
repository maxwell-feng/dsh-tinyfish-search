# Release notes — v0.13.0

English | [Chinese](RELEASE.zh.md)

Release date: 2026-09-28

**dsh-tinyfish-search** 0.13.0 aligns the plugin with DeepSeek Harness 0.2.0-rc.1. No runtime code, no configuration and no tool surface changed, so the plugin behaves exactly as 0.12.0 — except that it is now admitted by the peer-compatibility gate that 0.2.0-rc.1 enforces.

## Changed

- **Harness alignment.** Development dependencies move to DeepSeek Harness 0.2.0-rc.1, and this release is verified against it.
- **Peer ranges widen to `>=0.1.7-alpha.2 <0.3.0`.** DeepSeek Harness 0.2.0-rc.1 verifies every `@deepseek-ai/dsh*` peer range against the running runtime before it admits a row, and prereleases participate in range matching. The previous `^0.1.7-alpha.2` range excludes `0.2.x`, so `0.12.0` is refused on `0.2.0-rc.1`; the wider range admits both the `0.2.x` line — including `0.2.0-rc.1` — and every `0.1.7` prerelease from `0.1.7-alpha.2` through `0.1.7-rc.2`. `engines.dsh` carries the same range; the Node engine range is unchanged.
- **Seam audit.** Every interface this plugin uses is identical in the 0.1.7-rc.2 and 0.2.0-rc.1 sources: the web search-provider seam, the credential resolver, the volatile configuration schema the Host reads, and the launch-environment lookup.
- **Source change.** Exactly one line of plugin source moved: the `USER_AGENT` version constant.
- **Supply-chain gate.** The workspace file now exempts the 0.2.0-rc.1 package set from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases.
- **Documentation.** The install, update, configuration, usage and uninstall guides carry the 0.13.0 banners and commands in both languages, and their compatibility-gate sections now state which plugin versions 0.2.0-rc.1 refuses.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.13.0`, or let the profile track the latest release. No manual steps: no configuration field, value or default changed. Users on DeepSeek Harness 0.2.0-rc.1 must move to 0.13.0 — `0.12.0` is refused there, and `dsh plugin allow-version` is only a risk-acknowledging override, not a compatibility fix. See CHANGELOG.md for the full history.

## Verification

- Type check and build are clean, and all 22 unit tests pass against DeepSeek Harness 0.2.0-rc.1 packages.
- A frozen-lockfile install passes pnpm's supply-chain gate.
- The harness's own published `evaluatePluginCompatibility` (`@deepseek-ai/dsh-app-boot@0.2.0-rc.1`) reports runtime `0.2.0-rc.1`, admits `dsh-tinyfish-search@0.13.0` on `0.2.0-rc.1`, `0.2.0`, `0.1.7-rc.2` and `0.1.7-alpha.2`, and refuses `dsh-tinyfish-search@0.12.0` on `0.2.0-rc.1` over its `^0.1.7-alpha.2` peers.
- The packed 0.13.0 tarball carries the built `lib/`, `cordis.patch.yml` and `LICENSE`, and its manifest is the one that gate admits above.
