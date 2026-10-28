# Install Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/INSTALL.zh.md)

> Verified against DeepSeek Harness **0.2.2-alpha.2** with `dsh-tinyfish-search` **0.18.0**.

This document covers the requirements, every install method, and how to verify the installation.

---

## 1. Requirements

- DeepSeek Harness `dsh` CLI at `>=0.1.7-alpha.2 <0.3.0` (any profile with the web seam, e.g. `web`) — verified on `0.2.2-alpha.2`
- The harness verifies the plugin's declared runtime requirement against the running runtime before it admits the row. Since DSH `0.2.1-alpha.4`, an own `engines.dsh` range decides alone and the `@deepseek-ai/dsh*` peers are ignored for that judgement; the peers are only a fallback when `engines.dsh` is absent. Both are matched with `includePrerelease`, so prerelease runtimes participate. This plugin declares `engines.dsh: ">=0.1.7-alpha.2 <0.3.0"`, so `0.2.2-alpha.2` (and the `0.2.x` line) and the whole `0.1.7` prerelease line are admitted. A runtime outside that range is refused at load with the exact requirement named, and only `dsh plugin allow-version` overrides that refusal — see the [Harness compatibility gate](README.md#harness-compatibility-gate).
- Node.js `^22.19.0 || >=24.0.0` (matches the harness engine range)
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys) (free to create; Search is free at any wallet balance)
- pnpm `>=10` for source-checkout and git installs (it builds `lib/` from source via the `prepare` script)

---

## 2. Install from the npm registry

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

or pin an exact version:

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.18.0
```

> **CLI syntax note**: Per DeepSeek Harness 0.2.1-alpha.1 specifications, `--profile <name>` must always precede forwarded subcommands such as `add`.

---

## 3. Install from git

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git installs fetch sources, not built artifacts: pnpm runs the package's `prepare` script, which compiles `lib/` from source via `tsc -p tsconfig.build.json`.

Pick up unreleased changes the same way before they reach npm — the command above always tracks the default branch.

---

## 4. Install from a tarball or source checkout

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.18.0.tgz
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

Then start a session and ask something requiring live information (e.g. "What is today's weather in Tokyo?"). Confirm the model calls `web_search` and the results carry TinyFish URLs/snippets. The web search settings card in the GUI shows provider `tinyfish` with `available: true` once the key is configured.

If the key is missing, the model is not offered `web_search` at all: since DeepSeek Harness 0.2.2 the plugin reports readiness through `WebSearchProvider.ready()`, and the tool layer withholds the tool instead of dispatching a call that cannot authenticate. A search that still runs without a key — a programmatic caller that bypasses that gate — fails with `WEB_PROVIDER_CREDENTIAL_MISSING` naming the configured variable. See the [Usage Guide](USAGE.md) error table.
