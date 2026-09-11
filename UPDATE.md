# Update Guide

English | [简体中文](UPDATE.zh.md)

> Verified against DeepSeek Harness **0.1.5-rc.2** with `dsh-tinyfish-search` **0.7.0**.

This document outlines how to upgrade `dsh-tinyfish-search` to the latest release and handle rollbacks.

---

## 1. Upgrade Instructions

### Upgrading via npm

```bash
dsh plugin --profile web update dsh-tinyfish-search@latest
```

or pin to a specific version:

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.7.0
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
dsh plugin --profile web add ./dsh-tinyfish-search-0.7.0.tgz
```

---

## 2. Upgrading to 0.7.0 from 0.6.x

0.7.0 refactors the codebase into a modular TypeScript architecture (`types.ts`, `config.ts`, `options.ts`, `provider.ts`, `index.ts`), retaining 100% backward compatibility for configuration and runtime settings. No breaking changes to existing settings: pnpm refreshes the package in place.

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
