# Release notes — v0.15.0

English | [Chinese](RELEASE.zh.md)

Release date: 2026-10-11

**dsh-tinyfish-search** 0.15.0 aligns the plugin with DeepSeek Harness 0.2.1-alpha.2, the latest release of the plugin-development documentation this plugin follows. It introduces native `icon.svg` vector artwork, bilingual display manifest resources (`locale/en.json`, `locale/zh.json`), self-contained prepare scripts, strict 100% pure TypeScript architecture, and updated `--profile <name>` CLI option placement.

## Added

- **Display metadata and icon.** Bundled native `icon.svg` vector artwork and bilingual display manifest resources (`locale/en.json`, `locale/zh.json`) conforming to DSH 0.2.1-alpha.2 display conventions for Plugin Manager. `package.json` exports `./locale/*.json`, `./icon` and declares top-level `"icon": "./icon.svg"`.
- **Self-contained prepare script.** Changed `"prepare"` in `package.json` to `"tsc -p tsconfig.build.json"` so git installs compile `lib/` cleanly without requiring a global `pnpm` binary on the host.

## Changed

- **Harness alignment.** Development dependencies move to DeepSeek Harness 0.2.1-alpha.2, and this release is verified against it.
- **Peer ranges stay `>=0.1.7-alpha.2 <0.3.0`.** DeepSeek Harness 0.2.1-alpha.2 verifies every `@deepseek-ai/dsh*` peer range against the running runtime before it admits a row. The plugin remains admitted across the entire `0.1.7` line and the `0.2.x` line (including `0.2.1-alpha.2`).
- **Retired legacy export.** Removed deprecated `"./package.json": "./package.json"` export from `package.json`.
- **User-Agent attribution.** `USER_AGENT` updated to `dsh-tinyfish-search/0.15.0`.
- **CLI syntax normalization.** Documented commands now place `--profile <name>` before forwarded subcommands (`add`, `remove`, `update`).

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.15.0`, or let the profile track the latest release. No manual steps: no configuration field, value or default changed. This is not a mandatory upgrade — `0.14.0` and `0.13.0` already load on DeepSeek Harness 0.2.1-alpha.2.

## Verification

- Type check and build are clean, and all 22 unit tests pass against DeepSeek Harness 0.2.1-alpha.2 packages.
- `node scripts/check-docs-language.ts` passing clean with zero findings across all document pairs.
