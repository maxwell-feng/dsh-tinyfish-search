# Release notes — v0.20.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-11-12

**dsh-tinyfish-search** 0.20.0 aligns the plugin with DeepSeek Harness `0.2.2-rc.2` and adds the provider `title`/`description` metadata the 0.2.2-rc.2 provider picker reads. Beyond the `USER_AGENT` version string and its assertion in `test/apply.test.ts`, the only source change is the additive `title`/`description` pair on `TinyFishSearchProvider`; the search provider, its readiness gate and every configuration field are otherwise unchanged.

## Changed

- **Harness alignment.** Every `@deepseek-ai/dsh-*` devDependency moves from `0.2.2-rc.1` to `0.2.2-rc.2`, and the lockfile is regenerated against 0.2.2-rc.2 (`@deepseek-ai/cordis` stays `~4.1.0`, `@deepseek-ai/schemastery` stays `~3.19.0`).
- **Provider picker metadata.** `TinyFishSearchProvider` declares the optional `title` (`TinyFish Search`) and `description` members that `dsh-web` added in 0.2.2-rc.2, so the Web search provider menu shows a friendly name and a short note instead of only the raw `tinyfish` id. Both members are optional on the seam, so the plugin still loads on older hosts that do not read them.
- **Double-line verification.** The build baseline is `0.2.2-rc.2` (released 2026-11-11 on the npm `next` tag); the plugin is also verified on `0.2.2-rc.1` (npm `latest`). Both lines report typecheck clean, build clean and all **24** unit tests passing.
- **Peer ranges unchanged.** The `@deepseek-ai/cordis` peer stays `^4.0.4 || ^4.0.6-alpha.1`; `engines.dsh` stays `>=0.1.7-alpha.2 <0.3.0`, so this release is **not a mandatory upgrade** — 0.19.0 loads on `0.2.2-rc.2` just as it did before.
- **Supply-chain gate.** The workspace file exempts the 0.2.2-rc.2 package set from pnpm's minimum-release-age gate; the list stays a single, lockfile-derived block.
- **User-Agent attribution.** `USER_AGENT` is bumped to `dsh-tinyfish-search/0.20.0`.

## Documentation

- The takeover note and the fallback note now name the base search default correctly: `deepseek-search-api` since 0.2.2-rc.2 (it was `deepseek-official` before), so removing the bundle layer falls back to the DeepSeek Search API.
- The bilingual verification baseline is now `0.2.2-rc.2` / plugin `0.20.0`, with `0.2.2-rc.1` recorded as the second line.

## Node floor on the new host

`0.2.2-rc.2` keeps the harness's own minimum Node.js at **24.9**. This plugin's `engines.node` stays `^22.19.0 || >=24.0.0` and is not changed, but on a `0.2.2-rc.2` host the stricter host rule decides, so the effective requirement there is Node 24.9+. Nothing in the plugin needs to change for that; the docs state it so the requirement is not a surprise.

`WebSearchProvider.search()`, `ready()` and their activation contract are unchanged between `0.2.2-rc.1` and `0.2.2-rc.2`, so the readiness gate introduced in 0.18.0 continues to apply on the new baseline.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.20.0`, or let the profile track the latest release. Nothing else to do: configuration fields, values and defaults are untouched, and the upgrade is optional — 0.19.0 already loads on `0.2.2-rc.2`. A host still on `0.2.2-rc.1` keeps working unchanged, because `engines.dsh` admits the whole `0.2.x` line.

## Verification

- `node scripts/check-docs-language.ts` clean with zero findings across all document pairs.
- `npx tsc -p tsconfig.json --noEmit` clean.
- `npm run build` clean; all **24** unit tests pass against DeepSeek Harness 0.2.2-rc.2 and again against 0.2.2-rc.1.
- The document pairs were additionally audited for table column mismatches, heading-level jumps, broken list numbering, undefined link references, mixed Chinese/English punctuation, duplicated words and structural drift between the two languages of a pair: zero findings.
- Not verified: a live boot into a real 0.2.2-rc.2 profile with the readiness gate exercised end to end, and a live TinyFish API request (the suite stubs `fetch`).
