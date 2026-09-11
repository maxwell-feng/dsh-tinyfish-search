# Update Guide

English | [简体中文](UPDATE.zh.md)

> Verified against DeepSeek Harness **0.1.5-rc.2** with `dsh-tinyfish-search` **0.8.1**.

This document outlines how to upgrade `dsh-tinyfish-search` to the latest release and handle rollbacks.

---

## 1. Upgrade Instructions

### Upgrading via npm

```bash
dsh plugin --profile web update dsh-tinyfish-search@latest
```

or pin to a specific version:

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.8.1
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
dsh plugin --profile web add ./dsh-tinyfish-search-0.8.1.tgz
```

---

## 2. Upgrading to 0.8.1 from 0.8.0 / 0.7.x

0.8.1 resolves all Dependabot security advisories for `js-yaml` (upgraded to `4.3.2`),
fixes CVE-2026-84375, GHSA-5p4m-2wfm-xmqj, CVE-2026-59869, and CVE-2026-53550, while
retaining the pure TypeScript architecture (zero JavaScript tracked). No breaking changes:
pnpm refreshes the package in place.

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
