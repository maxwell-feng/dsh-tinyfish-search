# Release notes — v0.12.0

English | [Chinese](RELEASE.zh.md)

Release date: 2026-09-24

**dsh-tinyfish-search** 0.12.0 aligns the plugin with DeepSeek Harness 0.1.7-rc.2. No runtime code, no configuration and no tool surface changed, so the plugin behaves exactly as 0.11.1.

## Changed

- **Harness alignment.** Development dependencies move to DeepSeek Harness 0.1.7-rc.2, and this release is verified against it.
- **Peer ranges are unchanged.** They stay ^0.1.7-alpha.2, the release line that introduced volatile config, so the plugin still installs on every 0.1.7 prerelease from alpha.2 through rc.2. The harness engine range and the Node engine range are unchanged.
- **Seam audit.** Every interface this plugin uses is identical in the rc.1 and rc.2 sources: the web search-provider seam, the credential resolver, the volatile configuration schema the Host reads, and the launch-environment lookup.
- **Source change.** Exactly one line of plugin source moved: the `USER_AGENT` version constant.
- **Supply-chain gate.** The workspace file now exempts the rc.2 packages from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases.
- **Documentation.** The install, update, configuration, usage and uninstall guides carry the 0.12.0 banners and commands in both languages.

## Fixed

- **Line endings.** The repository had no `.gitattributes`, so a Windows checkout wrote some files back as CRLF and left others as LF. Every text file is now pinned to LF, matching the sibling dsh-kingdee repository.
- **Older changelog entries.** The Chinese list repeated category labels across eight releases, one release body had shrunk to a single line, and a security entry had lost its CVE identifiers. The English side named the wrong user-agent value in one release. All are corrected.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.12.0`, or let the profile track the latest release. No manual steps. See CHANGELOG.md for the full history.

## Verification

- Type check and build are clean, and all 22 unit tests pass against DeepSeek Harness 0.1.7-rc.2.
- A frozen-lockfile install passes pnpm's supply-chain gate.
- The declared peers pass the host's own compatibility check on rc.2, rc.1 and alpha.2: admitted, no exemption required. A 0.1.6 host is refused, as the install and update guides state.
- The packed 0.12.0 tarball installs into a real 0.1.7-rc.2 profile and composes the dsh-tinyfish-search layer, patching the web and tool-web rows.
