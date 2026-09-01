# dsh-tinyfish-search

[English](#english) | [中文](#中文)

>  [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that backs the built-in `web_search` tool with the [TinyFish Search API](https://docs.tinyfish.ai/search-api). One GET per query, no model call — fast and free (TinyFish Search is free at any wallet balance).

---

## English

### What it does

DeepSeek Harness's built-in `web_search` tool normally runs through the DeepSeek Anthropic-compatible endpoint (`web-search-deepseek`). This plugin registers an alternative **web search provider** on the `ctx.web` capability seam:

- Stable provider id: `tinyfish`
- Every `web_search` call becomes `GET https://api.search.tinyfish.ai?query=...` with the `X-API-Key` header
- `results[]` (title / snippet / url / date) are normalized into the seam's portable source shape
- No LLM turn consumed per search — unlike the Anthropic server-tool approach

Installing the bundle **takes over the built-in `web_search` automatically**: the
bundle patch overrides the `web` seam row (`searchProvider: tinyfish`,
`fetchProvider: http` restated), because `dsh-base` pins the seam to
`deepseek-official` and would otherwise keep the tool on the DeepSeek backend.
Later layers (profile / home `cordis.patch.yml` / `--patch`) can still
override that row, and `available()` still requires a TinyFish API key.

### Requirements

- DeepSeek Harness `dsh` CLI (any profile with the web seam, e.g. `web`) — verified on `0.1.2-alpha.4` (latest `master`; `0.1.2-alpha.3` → `0.1.2-alpha.4` no seam changes)
- A [TinyFish API key](https://agent.tinyfish.ai/api-keys) (free to create; Search is free)

### Install

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

or from the repository / a tarball:

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # source checkout
dsh plugin --profile web add ./dsh-tinyfish-search-0.1.0.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git installs fetch sources, not built artifacts: pnpm runs the package's `prepare` script, which builds `lib/` from source. pnpm ≥ 10 requires you to allow the build once (it prints the exact `pnpm-workspace.yaml` snippet).

### Configure

Set your API key (recommended — no secret in config files):

**Linux / macOS:**

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # current shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # permanent (bash)
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # permanent (zsh)
source ~/.bashrc                                                 # or reopen the terminal
```

**Windows (PowerShell):**

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # permanent — takes effect in new terminals
$env:TINYFISH_API_KEY = "your_api_key_here"  # current session only
```

Or set fields in your profile's `cordis.yml` / patch layer:

```yaml
- insert:
    - id: dsh-tinyfish-search
      name: dsh-tinyfish-search
      config:
        # apiKey: "literal-key"          # alternative to the env var; avoid committing it
        # apiKeyEnv: TINYFISH_API_KEY     # default
        # baseURL: https://api.search.tinyfish.ai   # default
```

| Field | Default | Meaning |
|---|---|---|
| `apiKey` | — | Literal TinyFish API key (secret role; wins over the env var) |
| `apiKeyEnv` | `TINYFISH_API_KEY` | Environment variable carrying the API key |
| `baseURL` | `https://api.search.tinyfish.ai` | TinyFish Search API endpoint base |

### Verify

```sh
dsh --profile web --dump-config | grep tinyfish   # layer present
```

Inside a session, call `web_search` and check that results carry TinyFish URLs/snippets. The web search settings card in the GUI (`网页搜索`) shows the provider state.

### Usage

After installation, no code changes required. In any session with the `web` profile:

1. The model calls `web_search` as usual (e.g. “search for TinyFish docs”).
2. The harness routes it through `ctx.web → tinyfish → https://api.search.tinyfish.ai`.
3. Results appear as `WebSearchSource[]` (`url` / `title` / `snippet` / `publishedAt`) in the tool result.
4. Check GUI: **Settings → Web Search** shows provider `tinyfish` and `available: true` when the API key is configured.

Abort and error semantics follow the `dsh-web` seam: `WEB_PROVIDER_CREDENTIAL_MISSING` when no key, `WEB_ABORTED` on cancellation, `WEB_PROVIDER_ERROR` otherwise.

### Uninstall

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

Removes the bundle layer and the `tinyfish` provider registration. Restart `dsh --profile web` to confirm `web_search` falls back to the base `deepseek-official` provider (or none if no other provider is installed).

### Updating

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
# or from git, to pick up changes before they reach npm:
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

### Development

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test (mocked fetch)
```

Publishing to npm runs through GitHub Actions with npm **Trusted Publishing** (OIDC) — see [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) and the [npm docs](https://docs.npmjs.com/trusted-publishers/). Tag `vX.Y.Z` (or dispatch the workflow) to release; provenance is generated automatically.

### Release notes

See [CHANGELOG.md](./CHANGELOG.md) (bilingual) and the [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) page.

### License

MIT — see [LICENSE](./LICENSE).

---

## 中文

### 插件作用

DeepSeek Harness 内置的 `web_search` 工具默认走 DeepSeek 的 Anthropic 兼容端点（`web-search-deepseek`）。本插件在 `ctx.web` 能力缝上注册了一个**网页搜索提供方**：

- 稳定提供方 ID：`tinyfish`
- 每次 `web_search` 调用变成 `GET https://api.search.tinyfish.ai?query=...`，携带 `X-API-Key` 头
- 把 `results[]`（标题 / 摘要 / 链接 / 日期）归一化为缝接口的可移植来源结构
- **每次搜索不消耗一次模型调用**——与 Anthropic 服务器工具方案不同，更快更省

安装本插件后，内置 `web_search` 会被**自动接管**：bundle patch 会覆盖 `web` 能力缝行（`searchProvider: tinyfish`，并重述 `fetchProvider: http`）——因为 `dsh-base` 把该行钉死为 `deepseek-official`，否则插件即使注册了 provider，工具仍会走 DeepSeek 后端。更后层（profile / home `cordis.patch.yml` / `--patch`）仍可按 id 覆盖该行；并且 `available()` 仍要求配置 TinyFish API key。

### 环境要求

- DeepSeek Harness `dsh` CLI（任意带 web 缝的 profile，如 `web`）——已验证 `0.1.2-alpha.4`（最新 `master`；`0.1.2-alpha.3` → `0.1.2-alpha.4` 缝接口无变更）
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)（免费创建；Search 免费）

### 安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

或者从仓库 / tarball 安装：

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # 源码目录
dsh plugin --profile web add ./dsh-tinyfish-search-0.1.0.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git 安装拿到的是源码而非构建产物：pnpm 会运行包的 `prepare` 脚本从源码构建 `lib/`。pnpm ≥ 10 需要一次性允许构建（它会打印确切的 `pnpm-workspace.yaml` 片段）。

### 配置

设置 API key（推荐——配置文件中不出现密钥）：

**Linux / macOS：**

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # 仅当前 shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # 永久生效（bash）
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # 永久生效（zsh）
source ~/.bashrc                                                 # 或重开终端
```

**Windows（PowerShell）：**

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # 永久生效——新开的终端生效
$env:TINYFISH_API_KEY = "your_api_key_here"  # 仅当前会话生效
```

或在 profile 的 `cordis.yml` / patch 层设置字段：

```yaml
- insert:
    - id: dsh-tinyfish-search
      name: dsh-tinyfish-search
      config:
        # apiKey: "字面量密钥"          # 环境变量的替代方案；注意不要提交到仓库
        # apiKeyEnv: TINYFISH_API_KEY     # 默认值
        # baseURL: https://api.search.tinyfish.ai   # 默认值
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `apiKey` | — | TinyFish API key 字面量（secret 角色；优先于环境变量） |
| `apiKeyEnv` | `TINYFISH_API_KEY` | 承载 API key 的环境变量名 |
| `baseURL` | `https://api.search.tinyfish.ai` | TinyFish Search API 端点基地址 |

### 验证

```sh
dsh --profile web --dump-config | grep tinyfish   # 层已加载
```

在会话里调用 `web_search`，检查结果是否带 TinyFish 的链接/摘要。GUI 的「网页搜索」设置卡片会显示提供方状态。

### 使用

安装后无需代码改动。在任意带 `web` 能力的会话中：

1. 模型按常调用 `web_search`（如“搜索 TinyFish 文档”）。
2. 框架经 `ctx.web → tinyfish → https://api.search.tinyfish.ai` 路由请求。
3. 结果以 `WebSearchSource[]`（`url` / `title` / `snippet` / `publishedAt`）形式出现在工具结果中。
4. GUI：**设置 → 网页搜索** 显示提供方 `tinyfish` 与 `available: true`（已配置 API key 时）。

错误与中断语义遵循 `dsh-web` 缝接口：无密钥时 `WEB_PROVIDER_CREDENTIAL_MISSING`，取消时 `WEB_ABORTED`，其他为 `WEB_PROVIDER_ERROR`。

### 卸载

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

移除 bundle 层与 `tinyfish` 提供方注册。重启 `dsh --profile web` 后 `web_search` 回退到基础 `deepseek-official` 提供方（若未安装其他提供方则为空）。

### 升级

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
# 或走 git，在改动进入 npm 前先行取用：
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

### 开发

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test（mock fetch）
```

发布到 npm 通过 GitHub Actions 的 npm **Trusted Publishing**（OIDC）完成——见 [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) 与 [npm 文档](https://docs.npmjs.com/trusted-publishers/)。打 `vX.Y.Z` 标签（或手动触发工作流）即发布，构建溯源（provenance）自动生成。

### 更新说明

见 [CHANGELOG.md](./CHANGELOG.md)（中英双语）与 [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) 页面。

### 许可证

MIT — 见 [LICENSE](./LICENSE)。
