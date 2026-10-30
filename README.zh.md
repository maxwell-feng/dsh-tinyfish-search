# dsh-tinyfish-search

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/README.md) | 中文

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件，把内置 `web_search` 工具接到 [TinyFish Search API](https://docs.tinyfish.ai/search-api)。每次查询只需一次 GET，无模型调用——更快且免费（TinyFish Search 在任意钱包余额下免费）。

## 插件作用

DeepSeek Harness 内置的 `web_search` 工具默认走 DeepSeek 的 Anthropic 兼容端点（`web-search-deepseek`）。本插件在 `ctx.web` 能力缝上注册了一个**网页搜索提供方**：

- 稳定提供方 ID：`tinyfish`
- 每次 `web_search` 调用变成 `GET https://api.search.tinyfish.ai?query=...`，携带 `X-API-Key` 请求头
- 把 `results[]`（标题 / 摘要 / 链接 / 日期）归一化为缝接口的可移植来源结构
- 通过 `WebSearchProvider.ready()` 上报提供方就绪状态（DeepSeek Harness 0.2.2 起）：宿主在声明 `web_search` 之前会先询问它，因此没有可用 TinyFish 凭据的 profile 干脆不显示 `web_search` 工具，而不是显示一个每次调用都失败的工具
- **每次搜索都不会消耗模型轮次**——与 Anthropic 服务器工具方案不同
- 内置原生 `icon.svg` 矢量图标与中英双语清单资源（`locale/en.json`、`locale/zh.json`），完全符合 DSH 0.2.2-alpha.2 插件管理器展示规范
- 源码、脚本与构建配置均为纯 TypeScript 架构

安装本插件后，内置 `web_search` 会被**自动接管**：bundle patch 会覆盖 `web` 能力缝行（`searchProvider: tinyfish`，并重述 `fetchProvider: http`）——因为 `dsh-base` 把该行钉死为 `deepseek-official`，否则插件即使注册了 provider，工具仍会走 DeepSeek 后端。同时补丁还会**重新启用宿主层 `tool-web` 行**（`disabled: false`，并重述 `search: true`、`fetch: true` 及基础超时值）：`dsh-web-app` bundle 自带该行的禁用（Web 应用本应按 agent 预设逐会话组合 web 工具），缺了这一行，干净安装到 web profile 后模型根本看不到 `web_search` 工具。**作用范围说明**：重启用宿主行会让工具对本 profile 上的**每一个** agent 预设可见——包括原本不带 web 工具的预设（如 `minimal`）；自带 `tool-web` 行的预设仍会以自己的注册遮蔽这个全局注册。若希望把工具限定在单个预设内，请在 profile 的 `cordis.patch.yml` 中覆盖或移除 `tool-web` 行，并把 `tool-web` 加入该预设的 agent 组合。更后层（profile / home `cordis.patch.yml` / `--patch`）仍可按 id 覆盖这两行。

配置以**易变（volatile）schema** 声明（DeepSeek Harness 0.1.7 起）：Host 读取本插件导出的 `Config` schema，并为 Plugins 页上的 `dsh-tinyfish-search` 行渲染配置表单。插件侧不再有设置注册，也不再需要自带浏览器半端。保存的修改无需重启即对下一次搜索生效。

## 环境要求

- DeepSeek Harness `dsh` CLI（任意带 web 缝的 profile，如 `web`）——已在 `0.2.2-alpha.2` 上验证，该线是当前 `alpha` 线，也是携带 `WebSearchProvider.ready()` 的那条线；插件声明 `engines.dsh` 为 `>=0.1.7-alpha.2 <0.3.0`，因此整条 `0.1.7` 预发行线与 `0.2.x` 线均可通过准入，其中 `0.2.1-rc.*` 维护线早于 `ready()`，在该线上运行本插件时不启用就绪闸门
- Node.js `^22.19.0 || >=24.0.0`（与 harness 的引擎区间一致）
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)（免费创建；Search 免费）
- 宿主的凭据缝与启动环境（`@deepseek-ai/dsh-credentials`、`@deepseek-ai/dsh-launch-environment`）是必需的 peer 依赖——每个 `dsh` profile 都已自带

### 宿主兼容性闸门

DeepSeek Harness 会在准入插件行**之前**，用宿主声明的运行时要求校验正在运行的运行时版本，不兼容的插件会被直接拒绝，而不是照常加载。**从 `0.2.1-alpha.4` 起，判定规则有所变化：** 包自身声明了 `engines.dsh` 区间时，就只按该区间判定，兼容性判断完全忽略 `@deepseek-ai/dsh*` 的 `peerDependencies`；只有在缺少 `engines.dsh` 时才回退到逐条检查这些 peer。两者都按预发行规则匹配（`semver.satisfies(runtime, range, { includePrerelease: true })`），因此预发行版运行时也参与区间比较，拒绝记录中报告的字段是 `requirements` 而非 `peers`。

本插件声明 `engines.dsh: ">=0.1.7-alpha.2 <0.3.0"`，该区间在 `0.2.2-alpha.2`、`0.2.1-rc.2`、`0.2.0-rc.2`、`0.2.0-rc.1` 与整条 `0.1.7` 预发行线上均成立，因此无需任何豁免。`0.14.0` 与 `0.13.0` 的 `engines.dsh` 也已声明同一放宽区间，所以它们在 `0.2.2-alpha.2` 上同样被准入。但窄区间的 `0.12.0` 声明的是 `^0.1.7-alpha.2`，不含 `0.2.x`，所以 harness 在 `0.2.x` 上仍会拒绝 `0.12.0`——此时应升级到 `0.18.1`，而不是授予豁免。若你在声明区间之外的 `dsh` 上运行，DSH 会拒绝该行并打印确切的要求对；要显式接受该风险，请按提示对确切要求对授予豁免：

```sh
dsh plugin allow-version dsh-tinyfish-search@0.18.1 --dsh-version <your-dsh-version> --accept-risk
```

## 文档导航

- [安装说明文档](INSTALL.zh.md) ([英文](INSTALL.md))
- [使用说明文档](USAGE.zh.md) ([英文](USAGE.md))
- [配置说明文档](CONFIG.zh.md) ([英文](CONFIG.md))
- [更新说明文档](UPDATE.zh.md) ([英文](UPDATE.md))
- [卸载说明文档](UNINSTALL.zh.md) ([英文](UNINSTALL.md))
- [更新日志](CHANGELOG.zh.md) ([英文](CHANGELOG.md))

## 安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

或者从仓库 / tarball 安装：

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # 源码目录
dsh plugin --profile web add ./dsh-tinyfish-search-0.18.1.tgz
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> **命令行语法说明**：根据 DeepSeek Harness 0.2.1-alpha.1 规范，`--profile <name>` 必须置于 `add`、`remove`、`update` 等子命令之前。
>
> Git 安装拿到的是源码而非构建产物：pnpm 会运行包的 `prepare` 脚本，通过 `tsc -p tsconfig.build.json` 自动从源码编译构建 `lib/`。

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
        # location: US                    # 可选的地区定位，转发给 TinyFish 的 location
        # language: en                    # 可选的搜索语言，转发给 TinyFish 的 language
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

可用性、就绪与失败是三种不同信号。`available()` 是缝在操作执行时挑选提供方所用的本地低成本检查。`ready()` 回答的则是「针对某个聊天路由的模型请求而发起的搜索，有没有凭据可发」，`dsh-tool-web` 把它当作 `web_search` 的激活条件——没有可用凭据，就没有该工具。若搜索在无密钥的情况下仍然执行（例如绕过闸门的程序化调用方），会以 `WEB_PROVIDER_CREDENTIAL_MISSING` 失败，而不会在未认证的状态下打到 TinyFish。

错误与中断语义遵循 `dsh-web` 缝接口：无密钥时 `WEB_PROVIDER_CREDENTIAL_MISSING`，取消时 `WEB_ABORTED`，其他为 `WEB_PROVIDER_ERROR`。

TinyFish 不返回长摘要，也不返回生成式答案，因此插件既不为 `WebSearchSource.summary` 也不为 `WebSearchResult.content` 填值：两者在缝上是可选的，正因为并非每个提供方都会返回它们，凭空编造会让缝说谎。

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

从 ≤ 0.18.0 升级到 0.18.1 无需任何手工步骤：本版只更正上方 Requirements 一栏，其余一概未动——依赖、源码、测试与全部行为契约与 0.18.0 完全一致。

从 ≤ 0.17.1 升级到 0.18.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.2.2-alpha.2` 的对齐，并新增了新 `ctx.web` 契约引入的 `ready()` 成员。锁定的 `@deepseek-ai/dsh-*` 开发依赖与锁文件均移至 `0.2.2-alpha.2`，`@deepseek-ai/cordis` 升至 `~4.0.6-alpha.1`，cordis peer 放宽为 `^4.0.4 || ^4.0.6-alpha.1`（因此仍停留在 4.0.4 与 4.0.5 的宿主同样被准入），`@deepseek-ai/schemastery` 移至 `~3.18.6-alpha.1`，工作区供应链豁免清单刷新为该包集合，`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.18.0`。`engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`，搜索、映射与配置逻辑均未改动。

从 ≤ 0.16.0 升级到 0.17.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.2.1-rc.2` 的对齐——即本插件所遵循的插件开发文档的最新发行版。锁定的 `@deepseek-ai/dsh-*` 开发依赖与锁文件均移至 `0.2.1-rc.2`，`@deepseek-ai/cordis` 升至 `^4.0.5`、`@deepseek-ai/schemastery` 升至 `^3.18.5`，工作区供应链豁免清单刷新为该包集合，`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.17.0`。`engines.dsh` 与 peer 区间保持 `>=0.1.7-alpha.2 <0.3.0`，且搜索提供方代码未作改动。

从 ≤ 0.15.0 升级到 0.16.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.2.1-alpha.4` 的对齐——即本插件所遵循的插件开发文档的最新发行版。锁定的 `@deepseek-ai/dsh-*` 开发依赖与锁文件均移至 `0.2.1-alpha.4`，工作区供应链豁免清单刷新为该包集合，`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.16.0`。`@deepseek-ai/dsh-*` peer 保持 `>=0.1.7-alpha.2 <0.3.0`，且搜索提供方代码未作改动。

从 ≤ 0.14.0 升级到 0.15.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.2.1-alpha.2` 的对齐——即本插件所遵循的插件开发文档的最新发行版。本版本封装了原生 `icon.svg` 矢量图标与中英双语展示资源（`locale/en.json`、`locale/zh.json`），优化了自包含 `prepare` 构建脚本，更新了 `--profile` 命令行语法，并将 `USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.15.0`。`@deepseek-ai/dsh-*` peer 保持 `>=0.1.7-alpha.2 <0.3.0`。

从 ≤ 0.13.0 升级到 0.14.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.2.0-rc.2` 的对齐——即本插件所遵循的插件开发文档的当前发行版——且除 `USER_AGENT` 版本常量外不改动任何插件源码。`@deepseek-ai/dsh-*` peer 保持 `>=0.1.7-alpha.2 <0.3.0`，因此 `0.13.0` 在 `0.2.0-rc.2` 上本就被准入——本版并非强制升级，而是把 `devDependencies` 锁定到 `0.2.0-rc.2`，并针对它重新验证每一处消费的接缝。`0.2.0-rc.2` 的增量是纯新增的——Cordis Inspect 诊断、`TypertGateway.hasLiveClient()`，以及定时提问——均未触及本插件使用的任何接口。`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.14.0`。

从 ≤ 0.12.0 升级到 0.13.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.2.0-rc.1` 的对齐——即本插件所遵循的插件开发文档的当前发行版——且除 `USER_AGENT` 版本常量外不改动任何插件源码。`@deepseek-ai/dsh-*` peer 区间放宽为 `>=0.1.7-alpha.2 <0.3.0`：因为 `0.2.0-rc.1` 把 peer 兼容性做成了硬性拒绝，而原先的 `^0.1.7-alpha.2` 区间不含 `0.2.x`——正是这次放宽让插件在 `0.2.0-rc.1` 上通过准入，同时保持整条 `0.1.7` 预发行线仍可安装。所消费的全部接缝在 `0.1.7-rc.2` 与 `0.2.0-rc.1` 之间源码完全一致，配置字段没有任何迁移。`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.13.0`。

从 ≤ 0.11.1 升级到 0.12.0 无需任何手工步骤：本版完成与 DeepSeek Harness `0.1.7-rc.2` 的对齐——即本插件所遵循的插件开发文档的当前发行版——且除 `USER_AGENT` 版本常量外不改动任何插件源码。`@deepseek-ai/dsh-*` peer 保持 `^0.1.7-alpha.2`，因此插件在 `0.1.7-alpha.2` 至 `0.1.7-rc.2` 的每一个 `0.1.7` 预发行版上均可安装；所消费的全部接缝在 `0.1.7-rc.1` 与 `0.1.7-rc.2` 之间源码完全一致。`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.12.0`。

从 ≤ 0.11.0 升级到 0.11.1 无需任何手工步骤：本版不改运行时逻辑、不改配置、不改工具接口。仓库只保留 TypeScript 源码——双语文档闸门现为 [`scripts/check-docs-language.ts`](./scripts/check-docs-language.ts)，由 Node 直接剥离类型运行——并修正了若干文档排序缺陷。

从 ≤ 0.10.0 升级到 0.11.0 无需任何手工步骤，但这是一次**宿主基线抬升**：插件现在要求 DeepSeek Harness `0.1.7-alpha.2` 或更新，并已在 `0.1.7-rc.1` 上验证。在 `0.1.6` 宿主上 DSH 会拒绝该行（见[宿主兼容性闸门](#宿主兼容性闸门)）。配置迁移到 0.1.7 的易变 schema——字段、取值、默认值完全一致，只是编辑它们的表单换了实现。`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.11.0`。

从 ≤ 0.9.0 升级到 0.10.0 无需任何手工步骤：完成与 DeepSeek Harness `0.1.6-alpha.2` 的对齐（`@deepseek-ai/dsh-*` peer 现为 `^0.1.6-alpha.2`，Node `^22.19.0 || >=24.0.0`），`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.10.0`。

从 ≤ 0.8.3 升级到 0.9.0 无需任何手工步骤：完成与 DeepSeek Harness `0.1.6-alpha.1` 的对齐（`@deepseek-ai/dsh-*` peer 现为 `^0.1.6-alpha.1`，Node `^22.19.0 || >=24.0.0`），发布包现仅包含 `lib/`、`cordis.patch.yml` 与 `LICENSE`——各文档保留在本仓库中，不再随包安装进你的 profile。`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.9.0`。

从 ≤ 0.8.1 升级到 0.8.3 无需任何手工步骤：内置企业级 SSRF 深度网络安全防御，并在 DeepSeek Harness `0.1.5-rc.2` 上完成全量验证，`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.8.3`。

从 ≤ 0.8.0 升级到 0.8.1 无需任何手工步骤：全面修复了 Dependabot 报告的 `js-yaml` 安全漏洞（CVE-2026-84375、GHSA-5p4m-2wfm-xmqj、CVE-2026-59869、CVE-2026-53550），维持纯 TypeScript 架构（零 JavaScript 残留），`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.8.1`。

从 ≤ 0.7.0 升级到 0.8.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。插件采用纯 TypeScript 架构（零 JavaScript 残留），`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.8.0`。

从 ≤ 0.6.1 升级到 0.7.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。插件代码遵循官方规范全面重构为模块化 TypeScript 架构，`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.7.0`。

从 ≤ 0.5.0 升级到 0.6.1 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。可见的变化是 manifest 声明（`manifestVersion: 1`、`@deepseek-ai/dsh-*` peer 现为 `^0.1.5-rc.2`、Node `>=22`）与 `USER_AGENT` 归属头（`dsh-tinyfish-search/0.6.1`）。

从 ≤ 0.4.0 升级到 0.5.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。唯一可见的变化是 harness 基线（`@deepseek-ai/dsh-*` peer 现为 `^0.1.5-rc.1`，Node `>=22`）与 `USER_AGENT` 归属头（`dsh-tinyfish-search/0.5.0`）。

从 ≤ 0.2.1 升级到 0.3.0 无需任何手工步骤：设置节、补丁行与凭据引用都随 bundle 层携带，pnpm 会原地刷新包。唯一可见的变化是上文所述 `web`/`tool-web` 行的行为——若你本就自行覆盖过这两行，则一切保持你的覆盖不变。

## 开发

```sh
pnpm install
pnpm build     # tsc -> lib/
pnpm test      # node --test（mock fetch）
pnpm typecheck # tsc --noEmit，覆盖 src + test + scripts
```

仓库全量使用 TypeScript，没有需要同步维护的 JavaScript 源码。双语文档闸门为 [`scripts/check-docs-language.ts`](./scripts/check-docs-language.ts)，CI 在安装依赖之前用裸 Node 直接运行它（无需任何依赖）：

```sh
node scripts/check-docs-language.ts
```

发布到 npm 通过 GitHub Actions 的 npm **Trusted Publishing**（OIDC）完成——见 [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) 与 [npm 文档](https://docs.npmjs.com/trusted-publishers/)。打 `vX.Y.Z` 标签（或手动触发工作流）即发布，构建溯源（provenance）自动生成。

## 更新说明

见 [更新日志](./CHANGELOG.zh.md)（中文）与 [CHANGELOG.md](./CHANGELOG.md)（英文），以及 [GitHub Releases](https://github.com/maxwell-feng/dsh-tinyfish-search/releases) 页面。

## 许可证

MIT — 见 [LICENSE](./LICENSE)。
