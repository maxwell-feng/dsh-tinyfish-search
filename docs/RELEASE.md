# Release notes — v0.18.1

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.zh.md)

Release date: 2026-10-30

**dsh-tinyfish-search** 0.18.1 is a documentation-only correction. No code, dependency, lockfile or behavioural contract changes: `src/`, `test/` and `package.json`'s dependency fields are identical to 0.18.0.

## Fixed

- **The Requirements entry named a stale release.** It described DeepSeek Harness `0.2.2-alpha.2` as the harness's "latest release". That stopped being true when `0.2.1-rc.5` shipped on 2026-10-30. The two are not successive releases on one line: `0.2.2-alpha.2` belongs to the `alpha` line, while `0.2.1-rc.5` is a maintenance release cut from the older `0.2.1` line and does not carry the `WebSearchProvider.ready()` contract at all. The entry now names the line that does carry it, and explains what a profile on the maintenance line experiences: the plugin loads and searches normally, but the readiness gate is not available, so the harness cannot withhold `web_search` when the credential is missing.
- **Both languages corrected together.** The English and Chinese README carried the same stale claim and were fixed in the same change, so the pair stays equivalent.

## Why this is a patch release

- The claim was already published: `dsh-tinyfish-search@0.18.0` on npm and its GitHub release both carry the incorrect sentence, and the npm package's README is what users read on the registry page. A patch republishes the corrected text.
- No behaviour changed, so a patch — not a minor — is the honest increment.

## Upgrade

Run `dsh plugin --profile web add dsh-tinyfish-search@0.18.1`, or let the profile track the latest release. Nothing else to do: configuration fields, values and defaults are untouched, and 0.18.0 already loads correctly on every admitted harness version. The upgrade is optional and trades only the corrected README text.

## Verification

- `node scripts/check-docs-language.ts` clean with zero findings across all document pairs.
- `npx tsc -p tsconfig.json --noEmit` clean.
- `npm run build` clean; all **24** unit tests pass.
- A documentation linter checks each document pair for table column mismatches, heading-level jumps, broken list numbering, undefined link references, mixed Chinese/English punctuation, duplicated words, version declarations that disagree with `package.json`, and structural drift between the two languages of a pair. Both repositories report zero findings.
