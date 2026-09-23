# 更新日志

[英文](CHANGELOG.md) | 中文

本项目的所有重要版本演进记录均归档于此。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，并严格遵循 [语义化版本规范](https://semver.org/lang/zh-CN/)。

---

## [0.11.0] - 2026-09-23

### 适配 DeepSeek Harness 0.1.7-rc.1：schema 驱动的易变配置

**变更**

- **宿主对齐**：开发依赖锁定至 DeepSeek Harness `0.1.7-rc.1`（最新发行版），并已针对该版本完成验证。`@deepseek-ai/dsh-*` peer 区间为 `^0.1.7-alpha.2`——即引入易变配置的那条发布线——因此插件在 `0.1.7-alpha.2` 与 `0.1.7-rc.1` 上均可安装；对本插件消费的全部包而言，这两个版本的源码完全一致。`engines.dsh` 更新为 `^0.1.7-alpha.2`，`engines.node` 保持 `^22.19.0 || >=24.0.0`，`@deepseek-ai/cordis` 升至 `4.0.4`，`@deepseek-ai/schemastery` 升至 `3.18.4`。
- **配置迁移至 0.1.7 的易变 schema**：每个字段都声明为 `.volatile()`，`apply` 收到的因此是逐字段的活引用而非冻结值。插件不再向 `ctx.settings` 注册任何内容：Host 以 `entry.fiber.runtime.Config` 读取本插件导出的 `Config` schema，并以 profile 行 id 为键自行渲染该条目的配置表单。移除了 `ctx.inject(['settings'])`、`installSection` 调用与导出常量 `TINYFISH_SETTINGS_NAMESPACE`，并去掉了 `@deepseek-ai/dsh-settings` 依赖。
- **每次搜索一次快照**：提供方注册时传入一个 thunk，在每次搜索开始时对全部五个字段调用一次 `.get()`，因此单次搜索绝不会出现「保存前读到 `baseURL`、保存后读到 `apiKeyEnv`」的混读；提供方注册本身永不重建。
- **`pnpm-workspace.yaml`**：为 `0.1.7-rc.1` 的确切包集合显式豁免 pnpm 的最小发布年龄闸门——否则 DSH 持续发布的预发行版会被该闸门拦下。
- 请求头 `USER_AGENT` 升级为 `dsh-tinyfish-search/0.11.0`。

**新增**

- **补充宿主兼容性闸门说明**：DeepSeek Harness 0.1.7-rc.1 会在加载前用运行时版本校验插件的 `@deepseek-ai/dsh*` peer 依赖，不兼容的行会被直接拒绝。本发行版声明的 peer 均实际满足，无需豁免；README 与安装、更新文档均写明了该拒绝行为及 `dsh plugin allow-version` 豁免方式。
- 新增测试：断言 schema 为每个字段产出活引用，且携带 schema 驱动表单渲染所需的全部默认值。
- `scripts/check-docs-language.mjs` 在本地与 CI 中检查文档、源码文案与配对（CI 在安装依赖前运行）。

**文档变更**

- **双语文档规范化**：所有文档一文件一语言（`X.md` 英文、`X.zh.md` 中文），成对齐全、切换行统一；原本混排的双语更新日志已拆分，两份现覆盖全部版本。

**验证**

- `pnpm run typecheck` 零错误，`pnpm run build` 干净通过，**22** 项单元测试在 `@deepseek-ai/dsh-web` / `dsh-credentials` / `dsh-launch-environment` / `dsh-llm` `0.1.7-rc.1` 上全量通过。
- `node scripts/check-docs-language.mjs` 通过；`pnpm install --frozen-lockfile` 通过供应链策略校验。

---

## [0.10.0] - 2026-09-18

### 适配 DeepSeek Harness 0.1.6-alpha.2

- **宿主兼容性**：`@deepseek-ai/dsh-*` peer 依赖区间升级至 `^0.1.6-alpha.2`，开发依赖锁定至 `0.1.6-alpha.2`，`engines.dsh` 更新为 `^0.1.6-alpha.2`，`engines.node` 保持 `^22.19.0 || >=24.0.0`；
- **缝接口复核**：复核确认 `ctx.web`（`registerSearchProvider`、`WebSearchProvider`、`WebError`）、`ctx.settings.installSection`、`ctx.credentials.resolve` 与 `launchEnvironmentOf` 在 `0.1.6-alpha.2` 下完全兼容，严谨保留 SSRF 安全基线（仅允许 http/https，拦截 localhost/环回/私网/保留网段）；
- **标识头更新**：请求头 `USER_AGENT` 升级为 `dsh-tinyfish-search/0.10.0`；
- **严格测试与文档**：21 项单元测试全量通过，TypeScript 类型检查零错误。全面刷新全套双语文档，写明适配 DeepSeek Harness `0.1.6-alpha.2`。

---
## [0.9.0] - 2026-09-16

### 适配 DeepSeek Harness 0.1.6-alpha.1 与精简发行包

- **宿主兼容性**：`@deepseek-ai/dsh-*` peer 区间改为 `^0.1.6-alpha.1`（旧区间 `^0.1.5-rc.2` 按 SemVer 预发布规则不满足 `0.1.6` 的预发布版本，在 `0.1.6` 宿主上安装会报未满足 peer）；`devDependencies` 同步升级，`engines.dsh` = `^0.1.6-alpha.1`，`engines.node` = `^22.19.0 || >=24.0.0`；
- **缝接口复核**：`ctx.web`、`ctx.settings.installSection`、`ctx.credentials.resolve`、`launchEnvironmentOf` 在两个 harness 版本之间源码完全一致，提供方源码零改动，SSRF 防御原样保留；
- **精简发行包**：发布 tarball 仅含 `lib/`、`cordis.patch.yml` 与 `LICENSE`（15 个文件 / 14.8 kB，此前 27 个文件 / 35.9 kB），双语文档不再随包安装进 `node_modules`；
- `USER_AGENT` 升级为 `dsh-tinyfish-search/0.9.0`；21 项测试与类型检查全部通过。

---
## [0.8.3] - 2026-09-13

### 发行包资产优化

- 优化 Release 资产附件结构，仅保留生产安装包（`dsh-tinyfish-search-0.8.3.tgz`），不再挂载多余的原始 markdown 文档。

---
## [0.8.2] - 2026-09-13

### 安全加固与生态同步

- **SSRF 深度防御与主机边界校验**：
  - 在 `src/provider.ts` 中实现严格的协议与主机安全校验：仅允许 `http:` 与 `https:` 协议，自动拦截指向 `localhost`、环回地址（`127.0.0.0/8`, `::1`）、RFC1918 私网网段（`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`）及保留网段的请求，防范 SSRF 风险。
- **DeepSeek Harness 0.1.5-rc.2 验证与文档全面同步**：
  - 精简 `pnpm-workspace.yaml` 中的旧版本白名单声明；
  - 请求标识头 `USER_AGENT` 升级为 `dsh-tinyfish-search/0.8.2`；
  - 全面更新双语文档体系（`INSTALL.md`, `INSTALL.zh.md`, `UPDATE.md`, `UPDATE.zh.md`, `USAGE.md`, `USAGE.zh.md`, `CONFIG.md`, `CONFIG.zh.md`, `UNINSTALL.md`, `UNINSTALL.zh.md`, `README.md`, `README.zh.md`），明确标注经 DeepSeek Harness `0.1.5-rc.2` 全面验证；
  - 自动化测试用例扩充至 21 项，全量验证通过。

---
## [0.8.1] - 2026-09-11

### 安全修复

- 全面修复 Dependabot 报告的 `js-yaml` 漏洞（升级至 `4.3.2`，彻底解决 CVE-2026-84375 等 8 项安全告警）；
- 纯 TypeScript 架构；
- 请求标识头 `USER_AGENT` 升级为 `dsh-tinyfish-search/0.8.1`；
- 全套 20 项自动化测试验证通过。

---
## [0.8.0] - 2026-09-11

- 架构现代化与 DeepSeek Harness 0.1.5-rc.2 兼容。

---

## [0.7.0] - 2026-09-11

**变更**

**模块化 TypeScript 架构重构**

**变更**
- **模块化 TypeScript 架构重构**：
  - 严格按照官方 DeepSeek Harness 插件开发规范将单体代码重构为高内聚、模块化 TypeScript 架构。
  - 将公共类型独立拆分至 `src/types.ts`。
  - 将 Schemastery 校验逻辑与常量独立拆分至 `src/config.ts`。
  - 将凭据服务与启动环境多层解析链独立拆分至 `src/options.ts`。
  - 将 `TinyFishSearchProvider` 核心检索、HTTP 规范映射与结果规整独立拆分至 `src/provider.ts`。
  - 在 `src/index.ts` 中暴露标准 Cordis 插件入口，并完全保持向下兼容的导出接口。
  - 更新请求标识头 `USER_AGENT` 为 `dsh-tinyfish-search/0.7.0`。
  - 重新编译并验证全套 20 项自动化测试全部通过。

---

## [0.6.1] - 2026-09-11

**兼容性**

**兼容性**
- **适配 DeepSeek Harness 0.1.5-rc.2 与清单规范现代化**：
  - 在 `package.json.dsh` 中显式声明 `manifestVersion: 1`，遵循最新的 `@deepseek-ai/dsh-package-manifest` 插件规范。
  - 在 `package.json.engines` 中声明兼容宿主范围 `"dsh": "^0.1.5-rc.2"`。
  - 将 peer 和 dev 依赖（`@deepseek-ai/dsh-web`、`@deepseek-ai/dsh-credentials`、`@deepseek-ai/dsh-launch-environment`、`@deepseek-ai/dsh-settings`、`@deepseek-ai/dsh-llm`）升级至 `0.1.5-rc.2`。
  - 更新 `USER_AGENT` 请求头为 `dsh-tinyfish-search/0.6.1`。
  - 针对 DeepSeek Harness `0.1.5-rc.2` 完成全部测试验证。

---

## [0.5.0] - 2026-09-10

**兼容性**

**新增**

**兼容性**
- 已针对 deepseek-harness `0.1.5-rc.1`（最新发行版）验证：自 `0.1.5-alpha.1` 以来缝接口无任何变更 —— web 缝（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`）、凭据缝（`credentialRef`）、启动环境缝（`launchEnvironmentOf`）以及设置节安装（`ctx.settings.installSection`）在两个 tag 之间源码完全一致，内置 `@deepseek-ai/cordis` `4.0.2` 亦未变化。rc.1 的主要变更（`tool-web` 系统提示词的作用域感知）不涉及本插件消费的任何缝。`devDependencies` 升级至 `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` / `@deepseek-ai/dsh-settings` `0.1.5-rc.1`；peer 区间现为 `^0.1.5-rc.1`；engines 现为 `node >=22`（与 harness 区间一致）；`USER_AGENT` 升至 `dsh-tinyfish-search/0.5.0`。全部测试（20 项）在新区间依赖下通过。

**新增**
- **独立的 `INSTALL.md` / `INSTALL.zh.md` 与 `USAGE.md` / `USAGE.zh.md`**，补齐标准文档体系：安装方式、验证、搜索流转、提供方、凭据解析顺序、完整示例（线路输出取自发布构建实测）与错误表。
- **独立的 `README.zh.md`**：README 现为与其他指南一致的中英成对文档（`README.md` / `README.zh.md`）。

---

## [0.4.0] - 2026-09-09

**变更**

**变更**
- **适配最新版 DeepSeek Harness 0.1.5-alpha.1**：更新内部客户端标识 `USER_AGENT` 至 `dsh-tinyfish-search/0.4.0`，全面通过最新版 `dsh-web@0.1.5-alpha.1` 契约验证。
- **补齐标准四文档体系**：新增独立的配置说明（`CONFIG.zh.md` / `CONFIG.md`）、更新升级说明（`UPDATE.zh.md` / `UPDATE.md`）和卸载说明（`UNINSTALL.zh.md` / `UNINSTALL.md`）。
- **打包清单更新**：在 `package.json` 的 `files` 字段中正式纳入全部新说明文档，支持 npm 及离线 tarball 发布分发。

---

## [0.3.0] - 2026-09-05

**变更**

**修复**

**新增**

**变更**
- **为 `tool-web` 重启用行补充作用范围说明。** bundle 补丁有意重启用宿主层 `tool-web` 行（`@deepseek-ai/dsh-web-app` 自带该行禁用），因此 `web_search` / `web_fetch` 对组合了本 bundle 的 profile 上的**每一个** agent 预设可见——包括原本不带 web 工具的预设（如 `minimal`）。自带 `tool-web` 行的预设仍会以自己的注册为它的 agent 遮蔽这个全局注册。README 与补丁头注释现说明该作用范围，以及改为单预设限定的方法（在 profile 的 `cordis.patch.yml` 中覆盖/移除 `tool-web` 行，并把 `tool-web` 加入该预设的 agent 组合）。行的行为本身与 0.2.1 一致。
- **新增可选配置字段 `location` 与 `language`**，作为 `location` / `language` 查询参数转发给 TinyFish Search API（地区定位 / 搜索语言）。留空或未设置时不发送，默认请求线格式与 0.2.1 完全一致。两者均渲染在设置卡片上，并与其他字段一样支持设置热更新。
- **必需 peer 依赖声明回归诚实。** `@deepseek-ai/dsh-credentials` 与 `@deepseek-ai/dsh-launch-environment` 在模块加载时即被无条件导入，因此不再声明为 `optional`（可选 peer 解析失败同样会让 import 崩溃，原声明名不副实）。两者 peer 区间现为 `>=0.1.2-alpha.4`；`@deepseek-ai/dsh-web` 放宽为 `>=0.1.2-alpha.2`。所有 `dsh` profile 均已内置这三个包。

**修复**
- **`mapTinyFishResponse` 不再因 TinyFish 畸形响应抛异常。** 缺字符串 `url` 的结果项、非数组 `results`、非字符串的 `title` / `snippet` / `publishedAt` 字段均被跳过/丢弃，不再以被掩盖的 `TypeError` 形式包进无关的 `WEB_PROVIDER_ERROR`（"unprocessable response body"）。一条畸形响应现在退化为零来源。

**新增**
- **`apply()` 集成测试**，运行在真实 `@deepseek-ai/cordis` 运行时上（`test/apply.test.mjs`）：提供方注册、settings 服务可选性、`installSection` 接线及已提交修改对下一次搜索的生效、凭据解析链（credentials → 启动环境 → process env）、稳定的 `WEB_PROVIDER_CREDENTIAL_MISSING` 错误面。补丁测试现用 js-yaml 真实解析 `cordis.patch.yml`，并按 loader 的按键覆盖 / config 整体替换语义对真实 dsh-base 行做组合断言，取代原先对 YAML 原文的正则匹配。
- **移除死代码**：`declare const process` 垫片（所有环境读取本就经由 `globalThis.process`）。`USER_AGENT` 升至 `dsh-tinyfish-search/0.3.0`。

---

## [0.2.1] - 2026-09-04

**兼容性**

**兼容性**
- 已针对 deepseek-harness `0.1.3-alpha.1`（最新发行版）验证：自 `0.1.2-rc.1` 以来缝接口无任何变更 —— web 缝（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`）、凭据缝、启动环境缝以及设置节安装（`ctx.settings.installSection`）在两个 tag 之间源码完全一致，内置 `@deepseek-ai/cordis` `4.0.2` 与 loader / bundle 补丁机制亦未变化。0.1.3 的主要变更（环境代理支持、Session 持久化重构、文件附件）均不涉及本插件消费的任何缝。npm 上已发布的 `@deepseek-ai/dsh-*` 类型包仍为 `0.1.2-rc.1`（npm 上的最新版本）；由于缝源码未变，针对它们做类型检查与针对 `0.1.3-alpha.1` 源码等价。`USER_AGENT` 升至 `dsh-tinyfish-search/0.2.1`。全部测试通过。

---

## [0.2.0] - 2026-09-03

### 修复
- **修复：`tool-web` 重启用行现在显式清除 `disabled`（`disabled: false`）。** loader 的按 id 补丁合并是**按键生效**的：仅带 `config` 的行会重述配置但保留 `@deepseek-ai/dsh-web-app` bundle 自带的 `disabled: true`，因此 0.1.9 的重启用行依然让 `web_search` 处于未注册状态。已用 `dsh --profile web --dump-config` 验证：组合后的 `tool-web` 行现为 `disabled: false`，模型可见的 `web_search` / `web_fetch` 工具正常挂载。

---

## [0.1.9] - 2026-09-03

### 修复

**修复：bundle 补丁现重新启用 `tool-web` —— 缺失时 `web_search` 根本不会注册。** `@deepseek-ai/dsh-web-app` bundle 自带 `tool-web` **禁用**行（dsh-base 仅在 headless/server 组合中启用它）。searxng-web 的补丁自己重新启用了该行，而 dsh-tinyfish-search 的补丁没有 —— 干净安装到 web profile 后模型看不到 `web_search` 工具，TinyFish 提供方完全闲置（此前"能用"的设备是因为排障时在 profile 补丁里手工加了 `tool-web` 覆盖行）。现按 searxng-web 的方式补上该行（`search: true`、`fetch: true` 及基础超时值）。

**按文档接入设置热更新** —— `apply` 现通过 `ctx.settings.installSection` 注册配置（命名空间 `dsh-tinyfish-search`），与 `web-search-deepseek` 完全一致：Plugins 设置卡片可渲染该节，保存的修改（如新的 `apiKeyEnv` 或 `baseURL`）无需重启即对下一次搜索生效。同时删除了无操作死代码及其误导性注释。

---

## [0.1.8] - 2026-09-03

**兼容性**

**兼容性**
- 已针对 deepseek-harness `0.1.2-rc.1`（最新 `master`）验证：自 `0.1.2-alpha.5` 以来 web 缝接口（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）、凭据缝与启动环境缝均无变更；内置 `@deepseek-ai/cordis` `4.0.2` 与 loader / bundle 补丁机制亦未变化。`devDependencies` 升级至 `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` `0.1.2-rc.1`，`USER_AGENT` 至 `dsh-tinyfish-search/0.1.8`。全部测试在新区间依赖下通过。

---

## [0.1.7] - 2026-09-02

**兼容性**

**兼容性**
- 已针对 deepseek-harness `0.1.2-alpha.5`（最新 `master`）验证：自 `0.1.2-alpha.4` 以来 web 缝接口（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）、凭据缝与启动环境缝均无变更；`devDependencies` 升级至 `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` `0.1.2-alpha.5`，`USER_AGENT` 至 `dsh-tinyfish-search/0.1.7`。全部测试在新区间依赖下通过。

---

## [0.1.6] - 2026-09-02

### 修复
- **修复 Harness `0.1.2-alpha.4` 后 `Search service unavailable`（`WEB_PROVIDER_UNAVAILABLE` / `WEB_PROVIDER_CONFIGURED_UNAVAILABLE`）。** 提供方现通过 Harness 凭据缝（`ctx.credentials.resolve` + `launchEnvironmentOf(ctx)`）解析 TinyFish API Key，而非仅 `process.env`，与 `dsh-web-search-deepseek` 保持一致。`available()` 现与该实现一致：只要存在解析器即视为可用，缺失密钥时在 `search()` 阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 明确定位（“请设置 `TINYFISH_API_KEY` / `dsh credentials set` / `apiKey`”），而非通用的 `unavailable`。`Config.apiKeyEnv` 现为 `role: 'credential-ref'`。请升级至 `0.1.6` 并通过 `TINYFISH_API_KEY` 环境变量或 `dsh credentials set` 配置密钥。已在 Harness `0.1.2-alpha.4` 上通过真实 TinyFish Search 验证（测试中 mock fetch，手工真实请求验证）。

---

## [0.1.5] - 2026-09-02

**兼容性**
- 已针对 deepseek-harness `0.1.2-alpha.4`（最新 `master`）验证：自 `0.1.2-alpha.3` 以来 `ctx.web` 缝接口（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）无变更；`devDependencies` 升级至 `@deepseek-ai/dsh-web 0.1.2-alpha.4` / `@deepseek-ai/dsh-llm 0.1.2-alpha.4`，`USER_AGENT` 至 `dsh-tinyfish-search/0.1.5`。

**文档**
- 新增显式**使用**与**卸载**章节（中英双语），补齐六项覆盖：发行版 / 更新说明 / 安装 / 卸载 / 使用 / 配置；环境要求现标明已验证的 `0.1.2-alpha.4`。

---

## [0.1.4] - 2026-09-01

**变更**
- 适配 DeepSeek Harness **0.1.2-alpha.3**（master）：`devDependencies` 锁定 `@deepseek-ai/dsh-web`、`@deepseek-ai/dsh-llm` 至 `0.1.2-alpha.3`，`@deepseek-ai/schemastery` 升至 `3.18.2`（alpha.3 检出所依赖的 schemastery 版本）；`@deepseek-ai/cordis` 保持 `4.0.2`。从 `0.1.2-alpha.2` 到 `0.1.2-alpha.3`，`ctx.web` 提供方契约（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）与缝注册表没有变化，因此无需改动提供方代码；全部测试在新区间依赖下通过。请求的 `user-agent` 归属头现在上报 `dsh-tinyfish-search/0.1.4`。

---

## [0.1.3] - 2026-08-31

**变更**
- 适配 DeepSeek Harness **0.1.2-alpha.2**：`devDependencies` 锁定 `@deepseek-ai/dsh-web`、`@deepseek-ai/dsh-llm` 至 `0.1.2-alpha.2`、`@deepseek-ai/cordis` 至 `4.0.2`；`@deepseek-ai/dsh-web` 的 peer 依赖区间下限升至 `0.1.2-alpha.2`。该版 harness 的 `ctx.web` 提供方契约（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）没有变化，因此无需改动提供方代码；全部测试在新区间依赖下通过。请求的 `user-agent` 归属头现在上报 `dsh-tinyfish-search/0.1.3`。

---

## [0.1.2] - 2026-08-30

**修复**
- bundle 的 `cordis.patch.yml` 现在随包附带 README「配置」一节所示的 `config` 脚手架（`apiKey` / `apiKeyEnv` / `baseURL`，全部为注释示例——在更后层覆盖该行之前均使用默认值），并由 patch 回归测试守护。

**变更**
- 请求的 `user-agent` 归属头现在上报包版本（`dsh-tinyfish-search/0.1.2`）。

---

## [0.1.1] - 2026-08-30

**修复**
- **修复了插件不生效的问题**：`dsh-base` 把 `web` 行的 `searchProvider` 钉死为 `deepseek-official`，因此仅仅注册 `tinyfish` provider 时，内置 `web_search` 仍走 DeepSeek 后端（用非 DeepSeek 密钥调用即报 “DeepSeek API error (HTTP 404)”）。按 harness 的层规则，bundle patch 现在按 id 覆盖 `web` 行（`searchProvider: tinyfish`，并完整重述 `fetchProvider: http`）——安装插件即自动将内置 `web_search` 切换到 TinyFish。更后层（profile / home `cordis.patch.yml` / `--patch`)仍可按 id 覆盖。
- 新增回归测试，断言 bundle patch 携带了 `web` 行覆盖。

---

## [0.1.0] - 2026-08-27

**功能**
首发版本。
- 在 DeepSeek Harness 的 web 能力缝（`ctx.web`）上注册 TinyFish 网页搜索提供方（`tinyfish`），使内置 `web_search` 工具改用 TinyFish Search API，不再走 DeepSeek 的 Anthropic 兼容端点。
- 每次搜索不消耗模型调用——普通 REST GET 请求，携带 `X-API-Key` 头；TinyFish Search 任意余额下免费。
- 将 `results[]`（标题 / 摘要 / 链接 / 日期）归一化为缝接口的 `WebSearchSource` 结构，按 URL 去重，并提前遵守 `maxResults` 上限。
- 支持通过 bundle patch 层配置：`apiKey`（secret 角色）、`apiKeyEnv`（默认 `TINYFISH_API_KEY`）、`baseURL`（默认 TinyFish 官方端点）。
- 采用缝接口的错误词表：`WEB_PROVIDER_CREDENTIAL_MISSING`、`WEB_PROVIDER_ERROR`、`WEB_ABORTED`。
- 以可安装 bundle 形式发布（`dsh.bundle` + `cordis.patch.yml`）：`dsh plugin --profile web add dsh-tinyfish-search`。
- 单元测试（node:test，mock fetch），覆盖映射、去重、上限、错误与取消。

**已知限制**
- 目前只透出缝接口的 `query` / `maxResults`；TinyFish 的扩展参数（`location`、`language`、`domain_type`、`recency_minutes` 等）暂未透传。
- 配置在插件加载时读取一次；运行中改动通过 Cordis HMR 热重载插件生效，而非轮询。

[0.11.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.11.0
[0.10.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.10.0
[0.9.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.9.0
[0.8.3]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.3
[0.8.2]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.2
[0.8.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.1
[0.8.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.8.0
[0.7.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.7.0
[0.6.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.6.1
[0.5.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.5.0
[0.4.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.4.0
[0.3.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.3.0
[0.2.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.2.1
[0.2.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.2.0
[0.1.9]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.9
[0.1.8]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.8
[0.1.7]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.7
[0.1.6]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.6
[0.1.5]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.5
[0.1.4]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.4
[0.1.3]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.3
[0.1.2]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.2
[0.1.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.1
[0.1.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.0
