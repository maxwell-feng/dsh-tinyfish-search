# Changelog

English | [Chinese](CHANGELOG.zh.md)

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.11.0] - 2026-09-23

### DeepSeek Harness 0.1.7-rc.1 Alignment — schema-driven volatile configuration

**Changed**

- **Harness alignment.** `devDependencies` are pinned to DeepSeek Harness `0.1.7-rc.1` (the latest release) and the plugin is verified against it. The `@deepseek-ai/dsh-*` peer ranges are `^0.1.7-alpha.2` — the release line that introduced volatile config — so the plugin stays installable on both `0.1.7-alpha.2` and `0.1.7-rc.1`; the two are source-identical for every package this plugin consumes. `engines.dsh` is `^0.1.7-alpha.2`, `engines.node` stays `^22.19.0 || >=24.0.0`, `@deepseek-ai/cordis` moves to `4.0.4`, and `@deepseek-ai/schemastery` moves to `3.18.4`.
- **Configuration migrated to the 0.1.7 volatile schema.** Every field is declared `.volatile()`, so `apply` receives one live reference per field instead of a frozen value. The plugin no longer registers anything on `ctx.settings`: the Host discovers the exported `Config` schema as `entry.fiber.runtime.Config` and renders this entry's form itself, keyed by the profile row id. Removed `ctx.inject(['settings'])`, the `installSection` call, and the exported `TINYFISH_SETTINGS_NAMESPACE`; dropped the `@deepseek-ai/dsh-settings` dependency.
- **One snapshot per search.** The provider is registered with a thunk that reads `.get()` for all five fields at the start of each search, so one search can never mix a `baseURL` read from before a committed edit with an `apiKeyEnv` read from after it. Provider registration itself is never replaced.
- **`pnpm-workspace.yaml`** now exempts the exact `0.1.7-rc.1` package set from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases.
- `USER_AGENT` bumped to `dsh-tinyfish-search/0.11.0`.

**Added**

- **Harness compatibility gate documented.** DeepSeek Harness 0.1.7-rc.1 verifies a plugin's `@deepseek-ai/dsh*` peers against the running runtime and refuses an incompatible row at load. This release declares peers it satisfies, so no exemption is needed; the README and the install and update guides document the refusal and its `dsh plugin allow-version` remedy.
- A test asserting the schema yields one live volatile reference per field and carries every default the schema-driven form renders.
- `scripts/check-docs-language.mjs` enforces documents, source strings and pairs locally and in CI, which runs it before installing dependencies.

**Changed (documentation)**

- **Documentation normalized.** Every document is single-language — `X.md` English, `X.zh.md` Chinese — with complete pairs and switcher lines; the bilingual changelog was split so both sides cover every release.

**Verification**

- `pnpm run typecheck` clean, `pnpm run build` clean, and **22** unit tests passing against `@deepseek-ai/dsh-web` / `dsh-credentials` / `dsh-launch-environment` / `dsh-llm` `0.1.7-rc.1`.
- `node scripts/check-docs-language.mjs` green; `pnpm install --frozen-lockfile` passes the supply-chain gate.

## [0.10.0] - 2026-09-18

### DeepSeek Harness 0.1.6-alpha.2 Alignment

- **Harness compatibility**: `@deepseek-ai/dsh-*` peer ranges updated to `^0.1.6-alpha.2`. `devDependencies` bumped to `0.1.6-alpha.2`, `engines.dsh` updated to `^0.1.6-alpha.2`, and `engines.node` remains `^22.19.0 || >=24.0.0`.
- **Seam audit**: Verified that all consumed seams (`ctx.web` search provider registration, `ctx.settings.installSection`, `ctx.credentials.resolve`, and `launchEnvironmentOf`) remain fully compatible with DSH `0.1.6-alpha.2`. SSRF defense policies (http/https only, rejection of localhost/loopback/private/reserved subnets) continue to protect all external requests.
- **Attribution**: `USER_AGENT` bumped to `dsh-tinyfish-search/0.10.0`.
- **Quality & Verification**: 21 unit tests passing, TypeScript compilation and typecheck completely clean. Refreshed all bilingual documentation for `0.1.6-alpha.2`.

## [0.9.0] - 2026-09-16

### DeepSeek Harness 0.1.6-alpha.1 Alignment & Lean Distribution

- **Harness compatibility**: `@deepseek-ai/dsh-*` peer ranges are now `^0.1.6-alpha.1` — the previous `^0.1.5-rc.2` range does not satisfy a `0.1.6` prerelease under SemVer prerelease rules, so a `0.1.6` host reported an unmet peer on install. `devDependencies` moved to the same set, `engines.dsh` is `^0.1.6-alpha.1`, and `engines.node` now follows the host range `^22.19.0 || >=24.0.0`.
- **Seam audit**: every seam this plugin consumes — `ctx.web` (`registerSearchProvider`, `WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`), `ctx.settings.installSection`, `ctx.credentials.resolve`, and `launchEnvironmentOf` — is source-identical between `0.1.5-rc.2` and `0.1.6-alpha.1`, so no provider source changed and the SSRF defenses (http/https only, localhost/loopback/private/reserved rejection) carry over unchanged.
- **Lean distribution package**: the published tarball now ships only `lib/`, `cordis.patch.yml`, and `LICENSE` — 15 files and 14.8 kB packed, down from 27 files and 35.9 kB. The bilingual guides stay in the repository and are no longer installed into your profile's `node_modules`. `package.json` and `LICENSE` are always packed by npm, and npm's packing rules also force the two `README` files.
- `USER_AGENT` bumped to `dsh-tinyfish-search/0.9.0`; typecheck clean and all 21 tests pass against `0.1.6-alpha.1`.

## [0.8.3] - 2026-09-13

### Release Asset Packaging

- Streamlined release assets to ship exclusively the production tarball without redundant raw documentation files.

## [0.8.2] - 2026-09-13

### Security & Ecosystem Synchronization

- **SSRF Defenses & Host Boundary Protection**:
  - Implemented strict protocol and host assertions in `src/provider.ts`: only `http:` and `https:` are permitted, and requests targeting `localhost`, loopback addresses (`127.0.0.0/8`, `::1`), RFC1918 private IP subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`), and reserved address spaces are strictly rejected.
- **DeepSeek Harness 0.1.5-rc.2 Verification & Document Refresh**:
  - Pruned legacy workspace multi-version rules in `pnpm-workspace.yaml`.
  - Bumped `USER_AGENT` attribution header to `dsh-tinyfish-search/0.8.2`.
  - Refreshed all bilingual documentation (`INSTALL.md`, `INSTALL.zh.md`, `UPDATE.md`, `UPDATE.zh.md`, `USAGE.md`, `USAGE.zh.md`, `CONFIG.md`, `CONFIG.zh.md`, `UNINSTALL.md`, `UNINSTALL.zh.md`, `README.md`, `README.zh.md`), confirming verification against DeepSeek Harness `0.1.5-rc.2`.
  - All 21 test cases passing.

## [0.8.1] - 2026-09-11

### Security

- **Resolved all Dependabot security alerts for `js-yaml`**:
  - Upgraded `js-yaml` devDependency from `4.1.1` to `4.3.2`.
  - Fixes CVE-2026-84375 (GHSA-2883-xcg3-v3hh), GHSA-5p4m-2wfm-xmqj (CVE-2026-59870), CVE-2026-59869 (GHSA-52cp-r559-cp3m), and CVE-2026-53550 (GHSA-h67p-54hq-rp68).
  - All 8 open Dependabot vulnerability alerts are now fully resolved and closed on GitHub.
  - Bumped `USER_AGENT` attribution header to `dsh-tinyfish-search/0.8.1`.
  - Recompiled and verified all 20 test cases pass.

## [0.8.0] - 2026-09-11

**Changed**

**Pure TypeScript Architecture Refactoring (Zero JavaScript)**:
  - Fully refactored into a pure TypeScript codebase following official DeepSeek Harness plugin development guidelines.
  - Completely removed all legacy `.mjs` / `.js` files from repository tracking and test runners.
  - Converted the entire test suite into pure TypeScript (`test/apply.test.ts`, `test/patch.test.ts`, `test/provider.test.ts`), executed natively using Node `--experimental-strip-types`.
  - Configured modern `allowImportingTsExtensions` and `rewriteRelativeImportExtensions` with dual `tsconfig.json` (strip-types runtime) and `tsconfig.build.json` (distribution compilation).
  - Cleanly modularized responsibilities: `src/types.ts`, `src/config.ts`, `src/options.ts`, `src/provider.ts`, and `src/index.ts`.
  - Bumped `USER_AGENT` to `dsh-tinyfish-search/0.7.0`.
  - Verified 100% test pass rate across all 20 tests.

## [0.7.0] - 2026-09-11

**Changed**

**Modular TypeScript Architecture Refactoring**:
  - Refactored monolithic codebase into dedicated modules following the official DeepSeek Harness plugin development guide (`docs/cookbook/adding-a-package.md` and `docs/user/develop/basic/index.md`).
  - Separated public types into `src/types.ts`.
  - Extracted Schemastery validation into `src/config.ts`.
  - Extracted multi-tiered credential and environment resolution into `src/options.ts`.
  - Extracted provider implementation, HTTP wire formatting, and result mapping into `src/provider.ts`.
  - Exported unified plugin entry from `src/index.ts` with backward-compatible API.
  - Bumped `USER_AGENT` to `dsh-tinyfish-search/0.7.0`.
  - Recompiled and verified all 20 test suite cases pass.

## [0.6.1] - 2026-09-11

**Compatibility**

- **DeepSeek Harness 0.1.5-rc.2 compliance & manifest modernization**:
  - Declared `manifestVersion: 1` under `package.json.dsh` conforming to `@deepseek-ai/dsh-package-manifest`.
  - Declared explicit host engine compatibility in `package.json.engines`: `"dsh": "^0.1.5-rc.2"`.
  - Bumped peer and dev dependencies (`@deepseek-ai/dsh-web`, `@deepseek-ai/dsh-credentials`, `@deepseek-ai/dsh-launch-environment`, `@deepseek-ai/dsh-settings`, `@deepseek-ai/dsh-llm`) to `0.1.5-rc.2`.
  - Bumped `USER_AGENT` attribution header to `dsh-tinyfish-search/0.6.1`.
  - Verified full test suite against DeepSeek Harness `0.1.5-rc.2`.

## [0.5.0] - 2026-09-10

**Compatibility**

- Verified against deepseek-harness `0.1.5-rc.1` (latest release): no seam changes since `0.1.5-alpha.1` — the web seam (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`), the credentials seam (`credentialRef`), the launch-environment seam (`launchEnvironmentOf`), and the settings section install (`ctx.settings.installSection`) are all source-identical between the two tags, as is the vendored `@deepseek-ai/cordis` `4.0.2`. The rc.1 headline change (scope-aware `tool-web` system-prompt guidance) does not touch any seam this plugin consumes. `devDependencies` bumped to `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` / `@deepseek-ai/dsh-settings` at `0.1.5-rc.1`; peer ranges now `^0.1.5-rc.1`; engines now `node >=22` (matching the harness range); `USER_AGENT` bumped to `dsh-tinyfish-search/0.5.0`. The full test suite (20 tests) passes against the new package set.

**Added**

- **Standalone `INSTALL.md` / `INSTALL.zh.md` and `USAGE.md` / `USAGE.zh.md`**, completing the standard documentation suite: install methods, verification, search flow, providers, credential resolution order, worked examples (wire outputs captured from the shipped build), and the error table.
- **Standalone `README.zh.md`**: the README is now an EN/ZH pair (`README.md` / `README.zh.md`) like every other guide.

## [0.4.0] - 2026-09-09

**Changed**
- **DeepSeek Harness 0.1.5-alpha.1 compatibility verified**: updated internal user agent to `dsh-tinyfish-search/0.4.0` and verified against the latest `dsh-web@0.1.5-alpha.1` capability seam.
- **Documentation standard suite added**: added dedicated standalone `CONFIG.md`, `CONFIG.zh.md`, `UPDATE.md`, `UPDATE.zh.md`, `UNINSTALL.md`, and `UNINSTALL.zh.md`.
- **Package manifest updated**: included newly created documentation files into package `files` manifest for npm and tarball distribution.

## [0.3.0] - 2026-09-05

**Changed**

- **Scope note documented for the `tool-web` re-enable row.** The bundle patch deliberately re-enables the HOST-level `tool-web` row (which `@deepseek-ai/dsh-web-app` ships disabled), so `web_search` / `web_fetch` are visible to *every* agent preset on a profile that composes this bundle — including presets that would not otherwise carry web tools (e.g. `minimal`). A preset mounting its own `tool-web` row still shadows the global registration for its agents. The README and the patch header now document this scope and how to scope the tools to one preset instead (override/remove the `tool-web` row in the profile's `cordis.patch.yml` and add `tool-web` to that preset's agent composition). The row behavior itself is unchanged from 0.2.1.
- **New optional config fields `location` and `language`**, forwarded to the TinyFish Search API as `location` / `language` query parameters (geo targeting / search language). Blank or unset values send nothing, so the default wire format is identical to 0.2.1. Both render on the settings card and support settings hot-reload like every other field.
- **Required peer dependencies made honest.** `@deepseek-ai/dsh-credentials` and `@deepseek-ai/dsh-launch-environment` are imported unconditionally at module load, so they are no longer declared `optional` in `peerDependenciesMeta` (an optional peer that fails to resolve crashes the import anyway — the declaration lied). Their peer ranges are now `>=0.1.2-alpha.4`; `@deepseek-ai/dsh-web` relaxes to `>=0.1.2-alpha.2`. Every `dsh` profile already carries all three.

**Fixed**

- **`mapTinyFishResponse` no longer throws on a malformed TinyFish response.** A result item without a string `url`, a non-array `results`, or non-string `title` / `snippet` / `publishedAt` fields are skipped/dropped instead of surfacing as a masked `TypeError` wrapped into an unrelated `WEB_PROVIDER_ERROR` ("unprocessable response body"). One malformed response now degrades to zero sources.

**Added**

- **Integration tests for `apply()`** on the real `@deepseek-ai/cordis` runtime (`test/apply.test.mjs`): provider registration, optional settings-service presence, `installSection` wiring with a committed edit reaching the next search, the credential resolution chain (credentials → launch environment → process env), and the stable `WEB_PROVIDER_CREDENTIAL_MISSING` surface. The patch test now parses `cordis.patch.yml` with js-yaml and asserts the composed rows against the real dsh-base rows under the loader's per-key/wholesale-replace semantics, instead of regex-scraping YAML text.
- **Dead code removed**: the `declare const process` shim (every ambient read already went through `globalThis.process`). `USER_AGENT` bumped to `dsh-tinyfish-search/0.3.0`.

## [0.2.1] - 2026-09-04

**Compatibility**

- Verified against deepseek-harness `0.1.3-alpha.1` (latest release): no seam changes since `0.1.2-rc.1` — the web seam (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`), the credentials seam, the launch-environment seam, and the settings section install (`ctx.settings.installSection`) are all source-identical between the two tags, as are the vendored `@deepseek-ai/cordis` `4.0.2` and the loader / bundle patch mechanism. 0.1.3's headline changes (environment-proxy support, Session persistence rework, file attachments) do not touch any seam this plugin consumes. The published `@deepseek-ai/dsh-*` type packages remain at `0.1.2-rc.1` (the newest release on npm); because the seam sources are unchanged, type-checking against them is equivalent to checking against `0.1.3-alpha.1` sources. `USER_AGENT` bumped to `dsh-tinyfish-search/0.2.1`. The full test suite passes.

## [0.2.0] - 2026-09-03

### Fixed
- - **Fix: the `tool-web` re-enable row now clears `disabled` explicitly (`disabled: false`).** The loader's id-patch merge is **per-key**: a config-only row restates `config` but leaves the `disabled: true` shipped by the `@deepseek-ai/dsh-web-app` bundle in place, so 0.1.9's re-enable row still left `web_search` unregistered. Verified with `dsh --profile web --dump-config`: the composed `tool-web` row now carries `disabled: false` and the model-facing `web_search` / `web_fetch` tools mount.

## [0.1.9] - 2026-09-03

### Fixed

- **Fix: the bundle patch now re-enables `tool-web` — without it `web_search` was never registered.** The `@deepseek-ai/dsh-web-app` bundle ships the `tool-web` row **disabled**; dsh-base enables it only in headless/server profiles. The searxng-web bundle re-enables the row in its own patch, but the dsh-tinyfish-search patch did not, so on a clean install into a web profile the model saw no `web_search` tool at all and the TinyFish provider sat idle (devices that appeared to work had a manual `tool-web` override in their profile patch from earlier debugging). The patch now restates the row with `search: true`, `fetch: true`, and the base timeouts, mirroring searxng-web.
- **Settings hot-reload per the docs** — `apply` now registers the config through `ctx.settings.installSection` (namespace `dsh-tinyfish-search`), exactly like `web-search-deepseek`: the Plugins settings card renders the section, and a saved edit (e.g. a new `apiKeyEnv` or `baseURL`) reaches the next search without a restart. Removed the dead no-op settings probe and its misleading comment.

## [0.1.8] - 2026-09-03

**Compatibility**

- Verified against deepseek-harness `0.1.2-rc.1` (latest `master`): no seam changes since `0.1.2-alpha.5` (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`, credentials seam, launch-environment seam); the vendored `@deepseek-ai/cordis` `4.0.2` and the loader/bundle patch mechanism are unchanged. Bumped `devDependencies` to `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` at `0.1.2-rc.1` and `USER_AGENT` to `dsh-tinyfish-search/0.1.8`. The full test suite passes against the new package set.

## [0.1.7] - 2026-09-02

**Compatibility**

- Verified against deepseek-harness `0.1.2-alpha.5` (latest `master`): no seam changes since `0.1.2-alpha.4` (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`, credentials seam, launch-environment seam). Bumped `devDependencies` to `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` at `0.1.2-alpha.5` and `USER_AGENT` to `dsh-tinyfish-search/0.1.7`. The full test suite passes against the new package set.

## [0.1.6] - 2026-09-02

### Fixed

- **Fix `Search service unavailable` (`WEB_PROVIDER_UNAVAILABLE` / `WEB_PROVIDER_CONFIGURED_UNAVAILABLE`) after harness `0.1.2-alpha.4`.** The provider now resolves the TinyFish API key through the harness credential seam (`ctx.credentials.resolve` + `launchEnvironmentOf(ctx)`) instead of only `process.env`, matching `dsh-web-search-deepseek`. `available()` now mirrors that provider: a resolver being present makes the provider usable, so a missing key surfaces as `WEB_PROVIDER_CREDENTIAL_MISSING` (“set `TINYFISH_API_KEY` / `dsh credentials set` / `apiKey`”) instead of the generic unavailable. `Config.apiKeyEnv` is now `role: 'credential-ref'`. Update `dsh-tinyfish-search` to `0.1.6` and ensure the key is set via `TINYFISH_API_KEY` env or `dsh credentials set TINYFISH_API_KEY <key>`. Verified on harness `0.1.2-alpha.4` with live TinyFish Search (mocked fetch in tests, live fetch manually verified).

## [0.1.5] - 2026-09-02

**Compatibility**

- Verified against deepseek-harness `0.1.2-alpha.4` (latest `master`): `ctx.web` seam unchanged since `0.1.2-alpha.3` (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`). Bumped `devDependencies` to `@deepseek-ai/dsh-web 0.1.2-alpha.4` / `@deepseek-ai/dsh-llm 0.1.2-alpha.4`, `USER_AGENT` to `dsh-tinyfish-search/0.1.5`.

**Docs**

- Added explicit **Usage** and **Uninstall** sections (EN+ZH), completing six-section bilingual coverage: Release / Changelog / Install / Uninstall / Usage / Config. Requirements now notes verified harness `0.1.2-alpha.4`.

## [0.1.4] - 2026-09-01

**Changed**

- Adapted to DeepSeek Harness **0.1.2-alpha.3** (master): `devDependencies` now pin `@deepseek-ai/dsh-web` and `@deepseek-ai/dsh-llm` at `0.1.2-alpha.3` and `@deepseek-ai/schemastery` moves to `3.18.2` (the schemastery revision the alpha.3 checkout builds against); `@deepseek-ai/cordis` stays at `4.0.2`. Between `0.1.2-alpha.2` and `0.1.2-alpha.3` the `ctx.web` provider contract (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`) and the seam registry are unchanged, so no provider code changes were required; the full test suite passes against the new package set. The request `user-agent` attribution header now reports `dsh-tinyfish-search/0.1.4`.

## [0.1.3] - 2026-08-31

**Changed**

- Adapted to DeepSeek Harness **0.1.2-alpha.2**: `devDependencies` now pin `@deepseek-ai/dsh-web` and `@deepseek-ai/dsh-llm` at `0.1.2-alpha.2` and `@deepseek-ai/cordis` at `4.0.2`, and the `@deepseek-ai/dsh-web` peer range now starts at `0.1.2-alpha.2`. The `ctx.web` provider contract (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`) is unchanged in this harness release, so no provider code changes were required; the full test suite passes against the new package set. The request `user-agent` attribution header now reports `dsh-tinyfish-search/0.1.3`.

## [0.1.2] - 2026-08-30

**Fixed**

- The bundle's `cordis.patch.yml` now ships the documented `config` scaffolding on the `dsh-tinyfish-search` row (`apiKey` / `apiKeyEnv` / `baseURL`, all commented out — defaults apply until a later layer overrides the row), matching the README "Configure" example; the patch test guards it.

**Changed**

- The request `user-agent` attribution header now reports the package version (`dsh-tinyfish-search/0.1.2`).

## [0.1.1] - 2026-08-30

**Fixed**

- **The bundle now actually takes over `web_search`**: the `dsh-base` bundle pins `searchProvider: deepseek-official` on the `web` row, so merely registering the `tinyfish` provider left the built-in tool on the DeepSeek backend (failing against a non-DeepSeek key with "DeepSeek API error (HTTP 404)"). Per the harness layer rules, the bundle patch now overrides the `web` row by id (`searchProvider: tinyfish`, `fetchProvider: http` restated) — installing the plugin switches the built-in `web_search` to TinyFish automatically. Later layers (profile / home `cordis.patch.yml` / `--patch`) can still override the row.
- Added a regression test asserting the bundle patch carries the `web` row override.

## [0.1.0] - 2026-08-27

**Added**

Initial release

- Register a TinyFish-backed web search provider (`tinyfish`) on the DeepSeek Harness web capability seam (`ctx.web`), so the built-in `web_search` tool queries the TinyFish Search API (`GET https://api.search.tinyfish.ai`) instead of the DeepSeek Anthropic-compatible endpoint.
- No LLM turn consumed per search — a plain REST GET with the `X-API-Key` header; TinyFish Search is free at any wallet balance.
- Normalizes `results[]` (title / snippet / url / date) into the seam's portable `WebSearchSource` shape, dedupes by URL, and honors `maxResults` early.
- Config through the bundle patch layer: `apiKey` (secret), `apiKeyEnv` (default `TINYFISH_API_KEY`), `baseURL` (default TinyFish canonical endpoint).
- Stable error mapping on the seam's vocabulary: `WEB_PROVIDER_CREDENTIAL_MISSING`, `WEB_PROVIDER_ERROR`, `WEB_ABORTED`.
- Ships as an installable bundle (`dsh.bundle` + `cordis.patch.yml`): `dsh plugin --profile web add dsh-tinyfish-search`.
- Unit tests (node:test, mocked fetch) covering mapping, dedupe, caps, errors, and cancellation.

**Known limitations**

- Only the seam's `query`/`maxResults` surface is exposed; TinyFish extras (`location`, `language`, `domain_type`, `recency_minutes`, etc.) are not forwarded yet.
- Config is read once at plugin load; live-setting edits hot-reload the plugin (Cordis HMR) rather than being polled.

[0.11.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.11.0
[0.10.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.10.0
[0.9.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.9.0
[0.8.3]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.3
[0.8.2]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.2
[0.8.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.1
[0.8.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.0
[0.7.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.7.0
[0.6.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.6.1
[0.5.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.5.0
[0.4.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.4.0
[0.3.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.3.0
[0.2.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.2.1
[0.2.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.2.0
[0.1.9]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.9
[0.1.8]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.8
[0.1.7]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.7
[0.1.6]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.6
[0.1.5]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.5
[0.1.4]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.4
[0.1.3]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.3
[0.1.2]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.2
[0.1.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.1
[0.1.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.0
