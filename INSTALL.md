# Install Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/INSTALL.zh.md)

## Requirements

- DeepSeek Harness `dsh` with the web seam, such as the `web` profile. Build baseline: `0.2.3-alpha.2` (released 2026-11-22). `engines.dsh`: `>=0.1.7-alpha.2 <0.3.0`.
- Node.js `^24.22.3 || >=26.13.1`. DSH 0.2.3 requires Node.js 24.22.3 or newer in the 24.x line, or Node.js 26.13.1 or newer.
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys). Search is free at any wallet balance.
- pnpm `>=10` for git and source-checkout installs, which build `lib/` through the `prepare` script.

DSH checks `engines.dsh` before it loads the row. A host outside the range is refused with the exact requirement named. `dsh plugin --profile <name> allow-version` can grant an exemption for that exact pair; see the [compatibility section](README.md#requirements).

## Install from npm

```sh
dsh plugin --profile web add dsh-tinyfish-search
dsh plugin --profile web add dsh-tinyfish-search@0.23.0   # pin an exact version
```

`--profile <name>` goes before `add`, `remove`, `update` and `allow-version`.

## Install from git

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

Git installs fetch sources. pnpm runs `prepare`, which compiles `lib/` with `tsc -p tsconfig.build.json`. The command tracks the default branch, so it also picks up unreleased changes.

## Install from a tarball or checkout

Run `npm pack` in the checkout first; it builds `lib/` and writes the `.tgz` named below.

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
dsh plugin --profile web add ./dsh-tinyfish-search        # source checkout
```

## Set the API key

Set the key before the first search. The environment variable keeps the secret out of config files.

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # permanent — new terminals
$env:TINYFISH_API_KEY = "your_api_key_here"  # current session
```

For a literal `apiKey`, a custom `apiKeyEnv` or the credentials service, see the [Configuration Guide](CONFIG.md).

## Verify

Check that the bundle layer is composed:

```sh
dsh --profile web --dump-config | grep tinyfish   # layer present
```

Open **Plugins → Built-in plugin settings → Web search and fetch** and confirm that the **Web search provider** menu lists **TinyFish Search** (id `tinyfish`). Then start a session and ask a question that needs live information, for example "What is today's weather in Tokyo?". The model should call `web_search`, and the results should carry TinyFish URLs and snippets.

If the key is missing, the model is not offered `web_search`: `WebSearchProvider.ready()` reports no usable credential, so the tool layer withholds the tool. A dispatched search that bypasses that gate fails with `WEB_PROVIDER_CREDENTIAL_MISSING` naming the configured variable. See the [Usage Guide](USAGE.md) error table.
