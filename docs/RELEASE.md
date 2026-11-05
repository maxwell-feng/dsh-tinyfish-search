# Release notes — v0.19.0

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-11-05

**dsh-tinyfish-search** 0.19.0 aligns the plugin with DeepSeek Harness `0.2.2-rc.1` and removes a stale dependency override. Apart from the `USER_AGENT` version string and its assertion in `test/apply.test.ts`, no plugin source changed: `src/`, `scripts/`, `locale/`, `.github/`, `cordis.patch.yml` and `tsconfig*.json` are otherwise identical to 0.18.1.

## Changed

- **Harness alignment.** Every `@deepseek-ai/dsh-*` devDependency moves from `0.2.2-alpha.2` to `0.2.2-rc.1`, and the lockfile is regenerated against 0.2.2-rc.1. `@deepseek-ai/cordis` moves from `~4.0.6-alpha.1` to `~4.1.0` and the `@deepseek-ai/schemastery` dependency from `~3.18.6-alpha.1` to `~3.19.0`.
- **Double-line verification.** The build baseline is `0.2.2-rc.1` (released 2026-11-04 on the npm `next` tag); the plugin is also verified on `0.2.1-rc.5` (npm `latest`, the desktop runtime). Both lines report typecheck clean, build clean and all **24** unit tests passing.
- **Peer ranges unchanged.** The `@deepseek-ai/cordis` peer stays `^4.0.4 || ^4.0.6-alpha.1`: `^4.0.4` already covers `4.1.0`, so no range change is needed. `engines.dsh` stays `>=0.1.7-alpha.2 <0.3.0`, so this release is **not a mandatory upgrade** — 0.18.1 loads on `0.2.2-rc.1` just as it did.
- **User-Agent attribution.** `USER_AGENT` is bumped to `dsh-tinyfish-search/0.19.0`.

## Fixed

- **A stale `@deepseek-ai/cosmokit` override contradicted cordis's declaration.** `pnpm-workspace.yaml` had carried `overrides: '@deepseek-ai/cosmokit': 1.8.7-alpha.1` since the first release on 2026-08-30. Cordis `4.1.0` declares `@deepseek-ai/cosmokit: ~1.9.0`, so that override forced the dependency tree onto a revision the declaration excludes — the declaration and the resolved tree disagreed. 0.19.0 deletes the override, and the lockfile now resolves cosmokit `1.9.0` as cordis declares. cosmokit `1.8.7-alpha.1` and `1.9.0` are byte-identical apart from their `package.json`, which is why no runtime failure ever surfaced; the inconsistency was latent, not benign, and it is corrected here.

## Node floor on the new host

`0.2.2-rc.1` raises the harness's own minimum Node.js to **24.9**. This plugin's `engines.node` stays `^22.19.0 || >=24.0.0` and is not changed, but on a `0.2.2-rc.1` host the stricter host rule decides, so the effective requirement there is Node 24.9+. Nothing in the plugin needs to change for that; the docs state it so the requirement is not a surprise.

`WebSearchProvider.ready()` and its activation contract are unchanged between `0.2.2-alpha.2` and `0.2.2-rc.1`, so the readiness gate introduced in 0.18.0 continues to apply on the new baseline.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.19.0`, or let the profile track the latest release. Nothing else to do: configuration fields, values and defaults are untouched, and the upgrade is optional — 0.18.1 already loads on `0.2.2-rc.1`. A host still on `0.2.1-rc.5` keeps working unchanged, because `engines.dsh` admits the whole `0.2.x` line.

## Verification

- `node scripts/check-docs-language.ts` clean with zero findings across all document pairs.
- `npx tsc -p tsconfig.json --noEmit` clean.
- `npm run build` clean; all **24** unit tests pass against DeepSeek Harness 0.2.2-rc.1 and again against 0.2.1-rc.5.
- The document pairs were additionally audited for table column mismatches, heading-level jumps, broken list numbering, undefined link references, mixed Chinese/English punctuation, duplicated words and structural drift between the two languages of a pair: zero findings.
- Not verified: a live boot into a real 0.2.2-rc.1 profile with the readiness gate exercised end to end, and a live TinyFish API request (the suite stubs `fetch`).
