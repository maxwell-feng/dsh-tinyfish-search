# dsh-tinyfish-search

[English](README.md) | 简体中文

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件，把内置 `web_search` 工具接到 [TinyFish Search API](https://docs.tinyfish.ai/search-api)。每次查询只需一次 GET，无模型调用——更快且免费（TinyFish Search 在任意钱包余额下免费）。

## 插件作用

DeepSeek Harness 内置的 `web_search` 工具默认走 DeepSeek 的 Anthropic 兼容端点（`web-search-deepseek`）。本插件在 `ctx.web` 能力缝上注册了一个**网页搜索提供方**：

- 稳定提供方 ID：`tinyfish`
- 每次 `web_search` 调用变成 `GET https://api.search.tinyfish.ai?query=...`，携带 `X-API-Key` 头
- 把 `results[]`（标题 / 摘要 / 链接 / 日期）归一化为缝接口的可移植来源结构
- **每次搜索不消耗一次模型调用**——与 Anthropic 服务器工具方案不同，更快更省

安装本插件后，内置 `web_search` 会被**自动接管**：bundle patch 会覆盖 `web` 能力缝行（`searchProvider: tinyfish`，并重述 `fetchProvider: http`）——因为 `dsh-base` 把该行钉死为 `deepseek-official`，否则插件即使注册了 provider，工具仍会走 DeepSeek 后端。同时补丁还会**重新启用宿主层 `tool-web` 行**（`disabled: false`，并重述 `search: true`、`fetch: true` 及基础超时值）：`dsh-web-app` bundle 自带该行的禁用（Web 应用本应按 agent 预设逐会话组合 web 工具），缺了这一行，干净安装到 web profile 后模型根本看不到 `web_search` 工具。**作用范围说明**：重启用宿主行会让工具对本 profile 上的**每一个** agent 预设可见——包括原本不带 web 工具的预设（如 `minimal`）；自带 `tool-web` 行的预设仍会以自己的注册遮蔽这个全局注册。若希望把工具限定在单个预设内，请在 profile 的 `cordis.patch.yml` 中覆盖或移除 `tool-web` 行，并把 `tool-web` 加入该预设的 agent 组合。更后层（profile / home `cordis.patch.yml` / `--patch`）仍可按 id 覆盖这两行。配置同时以 `dsh-tinyfish-search` 设置节暴露（Plugins 设置页）：保存的修改无需重启即对下一次搜索生效。

## 环境要求

- DeepSeek Harness `dsh` CLI（任意带 web 缝的 profile，如 `web`）——已在最新版 `0.1.5-rc.2` 上全面验证
- Node.js `>=22`（与 harness 的引擎区间一致）
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)（免费创建；Search 免费）
- harness 凭据缝与启动环境（`@deepseek-ai/dsh-credentials`、`@deepseek-ai/dsh-launch-environment`）为必需 peer 依赖——所有 `dsh` profile 均已内置

## 文档导航

- [安装说明文档](INSTALL.zh.md) ([English](INSTALL.md))
- [使用说明文档](USAGE.zh.md) ([English](USAGE.md))
- [配置说明文档](CONFIG.zh.md) ([English](CONFIG.md))
- [更新说明文档](UPDATE.zh.md) ([English](UPDATE.md))
- [卸载说明文档](UNINSTALL.zh.md) ([English](UNINSTALL.md))
- [更新日志 (Changelog)](CHANGELOG.md)

## 安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

或者从仓库 / tarball 安装：

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # 源码目录
dsh plugin --profile web add ./dsh-tinyfish-search-0.7.0.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git 安装拿到的是源码而非构建产物：pnpm 会运行包的 `prepare` 脚本从源码构建 `lib/`。pnpm ≥ 10 需要一次性允许构建（它会打印确切的 `pnpm-workspace.yaml` 片段）。

详见[安装说明](INSTALL.zh.md)：环境要求、全部安装方式与验证步骤。

## 配置

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
        # location: US                    # 可选的地区定位，转发给 TinyFish 的 `location`
        # language: en                    # 可选的搜索语言，转发给 TinyFish 的 `language`
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `apiKey` | — | TinyFish API key 字面量（secret 角色；优先于环境变量） |
| `apiKeyEnv` | `TINYFISH_API_KEY` | 承载 API key 的环境变量名 |
| `baseURL` | `https://api.search.tinyfish.ai` | TinyFish Search API 端点基地址 |
| `location` | — | 可选地区，转发为 TinyFish 的 `location`（如 `US`）；留空/未设置则不发送 |
| `language` | — | 可选搜索语言，转发为 TinyFish 的 `language`（如 `en`）；留空/未设置则不发送 |

完整 schema、凭据解析顺序与运行时设置界面见[配置说明](CONFIG.zh.md)。

## 验证

```sh
dsh --profile web --dump-config | grep tinyfish   # 层已加载
```

在会话里调用 `web_search`，检查结果是否带 TinyFish 的链接/摘要。GUI 的「网页搜索」设置卡片会显示提供方状态。

## 使用

安装后无需代码改动。在任意带 `web` 能力的会话中：

1. 模型按常调用 `web_search`（如“搜索 TinyFish 文档”）。
2. 框架经 `ctx.web → tinyfish → https://api.search.tinyfish.ai` 路由请求。
3. 结果以 `WebSearchSource[]`（`url` / `title` / `snippet` / `publishedAt`）形式出现在工具结果中。
4. GUI：**设置 → 网页搜索** 显示提供方 `tinyfish` 与 `available: true`（已配置 API key 时）。

错误与中断语义遵循 `dsh-web` 缝接口：无密钥时 `WEB_PROVIDER_CREDENTIAL_MISSING`，取消时 `WEB_ABORTED`，其他为 `WEB_PROVIDER_ERROR`。

提供方、凭据配置、完整示例与错误表见[使用说明](USAGE.zh.md)。

## 卸载

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

移除 bundle 层与 `tinyfish` 提供方注册，`web` / `tool-web` 行会恢复为底层 bundle 原本的组合值（移除插入层后，被插入行的覆盖即回到其自身默认）。重启 `dsh --profile web` 确认 `web_search` 回退到基础 `deepseek-official` 提供方（若未安装其他提供方则为空）。

## 升级

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
# 或走 git，在改动进入 npm 前先行取用：
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

从 ≤ 0.6.1 升级到 0.7.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。插件代码遵循官方规范全面重构为模块化 TypeScript 架构，`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.7.0`。

从 ≤ 0.5.0 升级到 0.6.1 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。可见的变化是元数据规范遵循最新 `@deepseek-ai/dsh-package-manifest`（`manifestVersion: 1`，宿主声明 `"dsh": "^0.1.5-rc.2"`，Node `>=22`）与 `USER_AGENT` 归属头（`dsh-tinyfish-search/0.6.1`）。

从 ≤ 0.4.0 升级到 0.5.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。唯一可见的变化是 harness 基线（`@deepseek-ai/dsh-*` peer 现为 `^0.1.5-rc.1`，Node `>=22`）与 `USER_AGENT` 归属头（`dsh-tinyfish-search/0.5.0`）。

从 ≤ 0.2.1 升级到 0.3.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。唯一可见的变化是上文所述 `web`/`tool-web` 行的行为——若你本就自行覆盖过这两行，则一切保持你的覆盖不变。

## 开发

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test（mock fetch）
```

发布到 npm 通过 GitHub Actions 的 npm **Trusted Publishing**（OIDC）完成——见 [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) 与 [npm 文档](https://docs.npmjs.com/trusted-publishers/)。打 `vX.Y.Z` 标签（或手动触发工作流）即发布，构建溯源（provenance）自动生成。

## 更新说明

见 [CHANGELOG.md](./CHANGELOG.md)（中英双语）与 [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) 页面。

## 许可证

MIT — 见 [LICENSE](./LICENSE)。
