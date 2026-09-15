# Update Guide

English | [简体中文](UPDATE.zh.md)

> Verified against DeepSeek Harness **0.1.5-rc.2** with `dsh-tinyfish-search` **0.8.3**.

This document outlines how to upgrade `dsh-tinyfish-search` to the latest release and handle rollbacks.

---

## 1. Upgrade Instructions

### Upgrading via npm

```bash
dsh plugin --profile web update dsh-tinyfish-search@latest
```

or pin to a specific version:

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.9.0
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
dsh plugin --profile web add ./dsh-tinyfish-search-0.9.0.tgz
```

---

## 2. Upgrading to 0.9.0 from 0.8.3 / 0.8.x

0.9.0 aligns the plugin with DeepSeek Harness `0.1.6-alpha.1`. The `@deepseek-ai/dsh-*` peer ranges now
accept `^0.1.6-alpha.1` — the previous `^0.1.5-rc.2` range does not satisfy a `0.1.6` prerelease under
SemVer prerelease rules — and `engines.dsh` / `engines.node` follow the host (`^22.19.0 || >=24.0.0`).
Every seam this plugin consumes (`ctx.web`, `ctx.settings.installSection`, `ctx.credentials`,
`launchEnvironmentOf`) is source-identical between the two harness versions, so no source change was
needed. The published package now ships only `lib/`, `cordis.patch.yml`, and `LICENSE`: the guides stay
in the repository and are no longer installed into your profile. No configuration changes — pnpm
refreshes the package in place.

---

## 3. Verification

Start the profile:

```bash
dsh web
```

Ask a query requiring live information (e.g. "What is today's weather in Tokyo?"). Confirm the model calls `web_search` and obtains real-time results from TinyFish.

---

## 3. Rollback

To roll back to a previous version:

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.4.0
```
