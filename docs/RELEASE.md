# Release notes — v0.18.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-10-28

**dsh-tinyfish-search** 0.18.0 aligns the plugin with DeepSeek Harness 0.2.2-alpha.2 and implements the readiness member that release added to the web provider contract. Search behavior, response mapping, error mapping and every configuration field stay as they were; the new work is that the provider can now tell the harness whether it has a credential to send, so the tool is withheld instead of failing.

## Added

- **`WebSearchProvider.ready(llmProvider)`.** `@deepseek-ai/dsh-web` 0.2.2-alpha.2 added an optional `ready(llmProvider): Promise<boolean>` to both provider contracts, and `dsh-tool-web` uses it as the activation condition of `web_search` — a model step whose route answers false neither declares nor dispatches the tool. The `tinyfish` provider answers by resolving the same credential chain a search uses: a literal `apiKey`, or a `resolveApiKey` thunk yielding a non-empty value, means ready; nothing else does. The check is configuration only and never contacts the network, so a present-but-wrong key still counts as ready. A credential store that throws while being read answers false, because the search would fail on that same read instead of finding a key. TinyFish authenticates every model route with one key, so `llmProvider` never changes the answer and is accepted for contract conformance only.
- **Two unit tests** pin the behavior: one drives the literal-key, resolver, empty-resolver and throwing-resolver cases while a stubbed `fetch` fails the test if it is ever called; the other asserts the mounted plugin's registered provider answers `ready()` from configuration alone, with and without a credential seam.

## Changed

- **Harness alignment.** Every `@deepseek-ai/dsh-*` devDependency moves from DeepSeek Harness 0.2.1-rc.2 to 0.2.2-alpha.2, and the lockfile is regenerated against 0.2.2-alpha.2. `@deepseek-ai/cordis` moves to `~4.0.6-alpha.1` and the `@deepseek-ai/schemastery` dependency to `~3.18.6-alpha.1`.
- **Peer range widened.** The `@deepseek-ai/cordis` peer becomes `^4.0.4 || ^4.0.6-alpha.1`, so a host still on cordis 4.0.4 or 4.0.5 admits the plugin alongside one on 4.0.6-alpha.1.
- **Supply-chain exemption rebuilt.** The workspace file exempts the 0.2.2-alpha.2 package set from pnpm's minimum-release-age gate, which otherwise rejects DSH's continuously published prereleases. The list stays a single lockfile-derived block.
- **User-Agent attribution.** The `USER_AGENT` constant now reads `dsh-tinyfish-search/0.18.0`.
- **Ranges compatibility.** `engines.dsh` is maintained at `>=0.1.7-alpha.2 <0.3.0`. The plugin remains admitted on runtime versions 0.1.7, 0.2.0, 0.2.1-rc.2 and 0.2.2-alpha.2 without manual exemptions.
- **Source change.** `ready()` and the `USER_AGENT` version string. `available()`, `search()`, `mapTinyFishResponse` and every configuration field are untouched.

## Deliberately not done

- **No `summary` or `content` pass-through.** The seam carries an optional `WebSearchSource.summary` and an optional `WebSearchResult.content`, but both are optional because not every provider returns them, and the upstream contract states that an adapter must not invent them. The TinyFish Search API returns `position`, `site_name`, `title`, `url`, `snippet` and `date` — plus a few type-specific extras under other `domain_type` values — with no long-form summary and no generated answer, and `src/types.ts` carries no such field. Nothing is mapped.

## Documentation

- Every bilingual document's verification baseline is now `0.2.2-alpha.2` / plugin `0.18.0`.
- README, CONFIG, INSTALL, UPDATE, USAGE, UNINSTALL and CHANGELOG updated in both languages, each side describing the same readiness behavior and the same upgrade steps.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.18.0`, or let the profile track the latest release. No manual steps: no configuration field, value or default changed. This is not a mandatory upgrade — `0.17.1` already loads on DeepSeek Harness 0.2.2-alpha.2.

## Verification

- `npx tsc -p tsconfig.json --noEmit` clean, `npm run build` clean, and all **24** unit tests pass against DeepSeek Harness 0.2.2-alpha.2 packages.
- `node scripts/check-docs-language.ts` passing clean with zero findings across all document pairs.
- Not verified: a live boot into a real 0.2.2-alpha.2 profile with the readiness gate exercised end to end, and a live TinyFish API request (the suite stubs `fetch`).
