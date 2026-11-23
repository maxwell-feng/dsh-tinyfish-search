# dsh-tinyfish-search

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/README.md) | 中文

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件，把内置 `web_search` 工具接到 [TinyFish Search API](https://docs.tinyfish.ai/search-api)。每次查询一次 GET，不消耗模型调用。

## 插件作用

插件在 `ctx.web` 上注册一个稳定 ID 为 `tinyfish` 的网页搜索提供方：

- 每次 `web_search` 调用变为 `GET https://api.search.tinyfish.ai`，携带 `x-api-key` 请求头。
- `results[]`（标题、摘要、链接、日期）映射为 `WebSearchSource`。
- `ready(llmProvider)` 上报是否已配置 API key。未配置密钥时，模型步不会被提供 `web_search`。
- 每次搜索不消耗模型轮次。
- 内置原生 `icon.svg` 与中英双语清单资源（`locale/en.json`、`locale/zh.json`），供插件管理器使用。

## 补丁行为

`cordis.patch.yml` 覆盖两个宿主行：

- `web`：设置 `searchProvider: tinyfish`，并重述 `fetchProvider: http`。自 DSH 0.2.2-rc.5 起，`dsh-base` 不再设置搜索提供方，改由 `dsh-web` 按模型路由选择：DeepSeek 路由使用旧版 Messages 搜索，其他路由使用 DeepSeek Search API。显式写入的 id 会把所有路由固定为 TinyFish。
- `tool-web`：以 `disabled: false` 重新启用宿主工具行，并重述 `search: true`、`fetch: true` 与基础超时值。`dsh-web-app` 自带该行并默认禁用；若不重新启用，全新安装的 web profile 将看不到 `web_search` 工具。

重新启用 `tool-web` 会让网页工具对本 profile 上的每个 agent 预设可见，包括原本不带这些工具的预设（如 `minimal`）。自带 `tool-web` 行的预设会用自身注册遮蔽它。若只想限定到单个预设，请在 profile 的 `cordis.patch.yml` 中覆盖或移除 `tool-web` 行，并把 `tool-web` 加入该预设的组合。后续的 profile、home 与 `--patch` 层仍可覆盖这两行。

配置使用易变 schema。Host 读取导出的 `Config`，为 **插件** 页面上的 `dsh-tinyfish-search` 行渲染表单。插件不提供设置界面代码。保存的修改无需重启即对下一次搜索生效。

## 环境要求

- 带 web 缝的 DeepSeek Harness `dsh`，例如 `web` profile。构建基线：`0.2.3-alpha.2`（2026-11-22 发布）。`engines.dsh`：`>=0.1.7-alpha.2 <0.3.0`。
- Node.js `^24.22.3 || >=26.13.1`。DSH 0.2.3 要求 Node.js 24.22.3 或更高的 24.x 版本，或 Node.js 26.13.1 或更高版本。
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)。Search 在任意钱包余额下免费。
- `@deepseek-ai/dsh-credentials` 与 `@deepseek-ai/dsh-launch-environment` 作为 peer 依赖。每个 `dsh` profile 都已自带。

DSH 在加载插件行之前，会用正在运行的版本校验声明的 `engines.dsh` 区间。区间之外的宿主会被拒绝，并打印确切的要求。要显式接受该风险：

```sh
dsh plugin --profile web allow-version dsh-tinyfish-search@0.23.0 --dsh-version <your-dsh-version> --accept-risk
```

文档：[安装](INSTALL.zh.md) · [配置](CONFIG.zh.md) · [使用](USAGE.zh.md) · [更新](UPDATE.zh.md) · [卸载](UNINSTALL.zh.md) · [更新日志](CHANGELOG.zh.md)。每篇都有英文版。

## 安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

从源码目录或本地构建的 tarball 安装（`npm pack` 会生成 `.tgz`）：

```sh
dsh plugin --profile web add ./dsh-tinyfish-search
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

`--profile <name>` 必须放在 `add`、`remove`、`update`、`allow-version` 之前。Git 安装会通过包的 `prepare` 脚本构建 `lib/`（`tsc -p tsconfig.build.json`）。

用 `dsh --profile web --dump-config | grep tinyfish` 检查 bundle 层是否已组合。然后打开 **插件 → 内置插件配置 → 网页搜索与获取**，**网页搜索提供方** 下拉框应列出 **TinyFish Search**（id `tinyfish`）。启动会话，提问一个需要实时信息的问题：结果应带 TinyFish 的链接与摘要。

## 配置

设置 API key（推荐）：

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # 仅当前 shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # 永久生效（bash）
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # 永久生效（zsh）
source ~/.bashrc                                                 # 或重开终端
```

Windows PowerShell 可用 `setx TINYFISH_API_KEY "your_api_key_here"` 对新终端生效，或用 `$env:TINYFISH_API_KEY = "your_api_key_here"` 仅对当前会话生效。

在 profile 的 `cordis.yml` 或 patch 层设置这些字段：

| 字段 | 默认值 | 含义 |
|---|---|---|
| `apiKey` | — | 字面量 API key（secret 角色；优先于环境变量） |
| `apiKeyEnv` | `TINYFISH_API_KEY` | 承载密钥的环境变量名 |
| `baseURL` | `https://api.search.tinyfish.ai` | API 端点基地址 |
| `location` | — | 可选地区定位；留空则不发送 |
| `language` | — | 可选搜索语言；留空则不发送 |

所有字段均为可选。完整 schema、凭据顺序与就绪规则见[配置说明](CONFIG.zh.md)。

## 使用

1. 模型按常调用 `web_search`。
2. 框架经 `ctx.web` → `tinyfish` → `https://api.search.tinyfish.ai` 路由。
3. 结果以 `WebSearchSource[]`（`url`、`title`、`snippet`、`publishedAt`）返回。

`available()` 是 **web 缝**在挑选提供方时使用的本地检查。`ready()` 决定某个模型步是否被提供该工具。未配置密钥时，`web_search` 会被收起；绕过闸门的已派发搜索则以 `WEB_PROVIDER_CREDENTIAL_MISSING` 失败。

错误遵循 `dsh-web` 缝：找不到密钥时为 `WEB_PROVIDER_CREDENTIAL_MISSING`，取消时为 `WEB_ABORTED`，其他为 `WEB_PROVIDER_ERROR`。示例与错误表见[使用说明](USAGE.zh.md)。

## 更新

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
```

本版把依赖更新到 DSH 0.2.3-alpha.2，将 Node.js 门槛提高到与 DSH 一致，并更新文档；正常搜索行为未改变，畸形响应处理更稳健。步骤与回滚见[更新说明](UPDATE.zh.md)。

## 卸载

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

这会移除 bundle 层与 `tinyfish` 提供方，`web` 与 `tool-web` 行回到底层 bundle 自带的取值。自带 `tool-web` 行的预设仍会保留 `web_search`，并回退到宿主自身的选择：0.2.2-rc.5 起，DeepSeek 模型路由使用 `deepseek-official`（旧版 Messages 搜索），其他路由使用 `deepseek-search-api`；0.2.2-rc.2 至 rc.4 为 `deepseek-search-api`；更早宿主为 `deepseek-official`；若未安装其他提供方则为空。依赖本 bundle 宿主级 `tool-web` 行的预设（如 `minimal`）将不再提供 `web_search`，直到为该预设恢复 `tool-web`。

## 开发

本项目由 dsh-superagent 辅助维护。

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test，mock fetch
pnpm typecheck # tsc --noEmit，覆盖 src + test + scripts
```

运行 `node scripts/check-docs-language.ts` 检查双语文档。发布通过 GitHub Actions 的 npm Trusted Publishing（OIDC）完成；见 [`.github/workflows/publish.yml`](./.github/workflows/publish.yml)。

发布说明：[CHANGELOG.zh.md](./CHANGELOG.zh.md) 或 [CHANGELOG.md](./CHANGELOG.md)，以及 [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) 页面。

## 许可证

MIT — 见 [LICENSE](./LICENSE)。
