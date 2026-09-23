# Update Guide

English | [Chinese](UPDATE.zh.md)

> Verified against DeepSeek Harness **0.1.7-rc.1** with `dsh-tinyfish-search` **0.11.0**.

This document outlines how to upgrade `dsh-tinyfish-search` to the latest release and handle rollbacks.

---

## 1. Upgrade Instructions

### Upgrading via npm

```bash
dsh plugin --profile web update dsh-tinyfish-search@latest
```

or pin to a specific version:

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.11.0
```

### Upgrading via Git Checkout

```bash
cd /path/to/dsh-tinyfish-search
git pull origin master
pnpm install
pnpm run build
```

Or refresh the profile link:

```bash
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

### Upgrading via Tarball

```bash
dsh plugin --profile web add ./dsh-tinyfish-search-0.11.0.tgz
```

---

## 2. Upgrading to 0.11.0 from 0.10.0 / 0.9.x

0.11.0 raises the harness floor to DeepSeek Harness `0.1.7-alpha.2` and is verified on `0.1.7-rc.1`.
The `@deepseek-ai/dsh-*` peer ranges accept `^0.1.7-alpha.2` — the release line that introduced
volatile config — `devDependencies` are bumped to `0.1.7-rc.1`, and `engines.dsh` is `^0.1.7-alpha.2`.

DeepSeek Harness 0.1.7 replaced the old settings seam with schema-driven volatile configuration, so
`apply` no longer calls `ctx.settings.installSection`: the Host discovers the exported `Config` schema
and renders the form for this entry, keyed by the profile row id. `TINYFISH_SETTINGS_NAMESPACE` is gone
with it, and the `@deepseek-ai/dsh-settings` peer is no longer consumed.

**On a `0.1.6` host the plugin is now refused at load.** DeepSeek Harness 0.1.7-rc.1 verifies a plugin's
declared `@deepseek-ai/dsh*` peers against the running runtime before admitting the row. Upgrade the
harness first, or grant the exact-version exemption DSH prints
(`dsh plugin allow-version dsh-tinyfish-search@0.11.0 <your-dsh-version>`).

Configuration fields remain 100% backward-compatible: the same keys, the same values, the same
defaults. SSRF defenses continue to protect requests.

---

## 3. Upgrading to 0.10.0 from 0.9.0 / 0.8.x

0.10.0 aligns the plugin with DeepSeek Harness `0.1.6-alpha.2`. The `@deepseek-ai/dsh-*` peer ranges now
accept `^0.1.6-alpha.2`, `devDependencies` are bumped to `0.1.6-alpha.2`, and `engines.dsh` is `^0.1.6-alpha.2`.
Every seam this plugin consumed at the time (`ctx.web`, `ctx.settings.installSection`, `ctx.credentials`,
`launchEnvironmentOf`) remains fully source-compatible. SSRF defenses continue to protect requests.
Configuration fields remain 100% backward-compatible.

---

## 4. Upgrading to 0.9.0 from 0.8.3 / 0.8.x

0.9.0 aligns the plugin with DeepSeek Harness `0.1.6-alpha.1`. The `@deepseek-ai/dsh-*` peer ranges now
accept `^0.1.6-alpha.1` — the previous `^0.1.5-rc.2` range does not satisfy a `0.1.6` prerelease under
SemVer prerelease rules — and `engines.dsh` / `engines.node` follow the host (`^22.19.0 || >=24.0.0`).
Every seam this plugin consumed (`ctx.web`, `ctx.settings.installSection`, `ctx.credentials`,
`launchEnvironmentOf`) is source-identical between the two harness versions, so no source change was
needed. The published package now ships only `lib/`, `cordis.patch.yml`, and `LICENSE`: the guides stay
in the repository and are no longer installed into your profile. No configuration changes — pnpm
refreshes the package in place.

---

## 5. Verification

Start the profile:

```bash
dsh web
```

Ask a query requiring live information (e.g. "What is today's weather in Tokyo?"). Confirm the model calls `web_search` and obtains real-time results from TinyFish.

---

## 6. Rollback

To roll back to a previous version:

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.4.0
```
