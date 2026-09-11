# Install Guide

English | [简体中文](INSTALL.zh.md)

> Verified against DeepSeek Harness **0.1.5-rc.2** with `dsh-tinyfish-search` **0.7.0**.

This document covers the requirements, every install method, and how to verify the installation.

---

## 1. Requirements

- DeepSeek Harness `dsh` CLI at `0.1.5-rc.2` or newer (any profile with the web seam, e.g. `web`)
- Node.js `>=22` (matches the harness engine range `^22.19.0 || >=24.0.0`)
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys) (free to create; Search is free at any wallet balance)
- pnpm `>=10` for source-checkout and git installs (it builds `lib/` from source via the `prepare` script)

---

## 2. Install from the npm registry

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

or pin an exact version:

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.7.0
```

---

## 3. Install from git

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git installs fetch sources, not built artifacts: pnpm runs the package's `prepare` script, which builds `lib/` from source. pnpm ≥ 10 requires you to allow the build once (it prints the exact `pnpm-workspace.yaml` snippet).

Pick up unreleased changes the same way before they reach npm — the command above always tracks the default branch.

---

## 4. Install from a tarball or source checkout

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.7.0.tgz
```

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # source checkout
```

---

## 5. Set the API key

Set the key before the first search (recommended — no secret in config files):

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # permanent — takes effect in new terminals
$env:TINYFISH_API_KEY = "your_api_key_here"  # current session only
```

All credential options (literal `apiKey`, custom `apiKeyEnv`, the credentials service) are documented in the [Configuration Guide](CONFIG.md).

---

## 6. Verify

Check the bundle layer is composed:

```sh
dsh --profile web --dump-config | grep tinyfish   # layer present
```

Then start a session and ask something requiring live information (e.g. “What is today's weather in Tokyo?”). Confirm the model calls `web_search` and the results carry TinyFish URLs/snippets. The web search settings card in the GUI (`网页搜索`) shows provider `tinyfish` with `available: true` once the key is configured.

If the key is missing, the first search fails with `WEB_PROVIDER_CREDENTIAL_MISSING` naming the configured variable — see the [Usage Guide](USAGE.md) error table.
