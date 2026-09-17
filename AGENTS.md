# AGENTS.md

Project instructions for agents working in this repository. The bilingual-docs rule below is enforced in CI by `scripts/check-docs-language.mjs` — run it before you finish any documentation change.

## Bilingual documentation rule (mandatory)

One language per file, always in pairs:

- `X.md` is English only; `X.zh.md` is Chinese only. No sentence of the other language may appear in the file — code fences, table cells and code comments included.
- Never ship one side alone: adding or changing a document updates both files in the same change.
- Switcher line, single language, within the first ten lines: the English side writes `English | [Chinese](X.zh.md)`; the Chinese side writes `[英文](X.md) | 中文`. Documents under `.github/` (issue forms, workflow config) carry no switcher.
- Forbidden: bilingual labels (`**Compatibility / 兼容性**`), bilingual entries on one line (`English… / 中文…`), and using one file as the shared home for both languages.
- Exempt (keep the original text): code, commands, paths, file names, field/API names, product proper nouns (TinyFish, DeepSeek Harness, BOS, WebAPI, API Key), quoted error literals, and fenced blocks inside Chinese documents.

## Exemptions registry

`scripts/check-docs-language.mjs` holds the `FILES` table — the single place an exemption is declared:

| Entry | Meaning |
| --- | --- |
| `language: 'en' \| 'zh'` | declared language for a file whose name does not say it |
| `pair: false` | no counterpart file required |
| `check: false` | exempt from the language scan (a file that must quote both languages) |

This repository declares `AGENTS.md` as pairing- and language-check exempt: it is an English instruction file that quotes both languages as examples.

## Self-check

```bash
node scripts/check-docs-language.mjs
```

It fails on: any Chinese character in an English document; an English sentence in a Chinese document (outside code, links, quoted literals and product names); a missing counterpart file; a malformed or missing switcher line.
