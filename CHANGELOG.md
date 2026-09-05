# Changelog / 更新说明

All notable changes to this project are documented here / 本项目的所有重要变更均记录于此。
The format follows [Keep a Changelog](https://keepachangelog.com/) / 格式遵循 [Keep a Changelog](https://keepachangelog.com/)。

## [0.3.0] - 2026-09-05

### English

**Changed / 变更**

- **Scope note documented for the `tool-web` re-enable row.** The bundle patch deliberately re-enables the HOST-level `tool-web` row (which `@deepseek-ai/dsh-web-app` ships disabled), so `web_search` / `web_fetch` are visible to *every* agent preset on a profile that composes this bundle — including presets that would not otherwise carry web tools (e.g. `minimal`). A preset mounting its own `tool-web` row still shadows the global registration for its agents. The README and the patch header now document this scope and how to scope the tools to one preset instead (override/remove the `tool-web` row in the profile's `cordis.patch.yml` and add `tool-web` to that preset's agent composition). The row behavior itself is unchanged from 0.2.1.
- **New optional config fields `location` and `language`**, forwarded to the TinyFish Search API as `location` / `language` query parameters (geo targeting / search language). Blank or unset values send nothing, so the default wire format is identical to 0.2.1. Both render on the settings card and support settings hot-reload like every other field.
- **Required peer dependencies made honest.** `@deepseek-ai/dsh-credentials` and `@deepseek-ai/dsh-launch-environment` are imported unconditionally at module load, so they are no longer declared `optional` in `peerDependenciesMeta` (an optional peer that fails to resolve crashes the import anyway — the declaration lied). Their peer ranges are now `>=0.1.2-alpha.4`; `@deepseek-ai/dsh-web` relaxes to `>=0.1.2-alpha.2`. Every `dsh` profile already carries all three.

**Fixed / 修复**

- **`mapTinyFishResponse` no longer throws on a malformed TinyFish response.** A result item without a string `url`, a non-array `results`, or non-string `title` / `snippet` / `publishedAt` fields are skipped/dropped instead of surfacing as a masked `TypeError` wrapped into an unrelated `WEB_PROVIDER_ERROR` ("unprocessable response body"). One malformed response now degrades to zero sources.

**Added / 新增**

- **Integration tests for `apply()`** on the real `@deepseek-ai/cordis` runtime (`test/apply.test.mjs`): provider registration, optional settings-service presence, `installSection` wiring with a committed edit reaching the next search, the credential resolution chain (credentials → launch environment → process env), and the stable `WEB_PROVIDER_CREDENTIAL_MISSING` surface. The patch test now parses `cordis.patch.yml` with js-yaml and asserts the composed rows against the real dsh-base rows under the loader's per-key/wholesale-replace semantics, instead of regex-scraping YAML text.
- **Dead code removed**: the `declare const process` shim (every ambient read already went through `globalThis.process`). `USER_AGENT` bumped to `dsh-tinyfish-search/0.3.0`.

### 中文

**变更 / Changed**

- **为 `tool-web` 重启用行补充作用范围说明。** bundle 补丁有意重启用宿主层 `tool-web` 行（`@deepseek-ai/dsh-web-app` 自带该行禁用），因此 `web_search` / `web_fetch` 对组合了本 bundle 的 profile 上的**每一个** agent 预设可见——包括原本不带 web 工具的预设（如 `minimal`）。自带 `tool-web` 行的预设仍会以自己的注册为它的 agent 遮蔽这个全局注册。README 与补丁头注释现说明该作用范围，以及改为单预设限定的方法（在 profile 的 `cordis.patch.yml` 中覆盖/移除 `tool-web` 行，并把 `tool-web` 加入该预设的 agent 组合）。行的行为本身与 0.2.1 一致。
- **新增可选配置字段 `location` 与 `language`**，作为 `location` / `language` 查询参数转发给 TinyFish Search API（地区定位 / 搜索语言）。留空或未设置时不发送，默认请求线格式与 0.2.1 完全一致。两者均渲染在设置卡片上，并与其他字段一样支持设置热更新。
- **必需 peer 依赖声明回归诚实。** `@deepseek-ai/dsh-credentials` 与 `@deepseek-ai/dsh-launch-environment` 在模块加载时即被无条件导入，因此不再声明为 `optional`（可选 peer 解析失败同样会让 import 崩溃，原声明名不副实）。两者 peer 区间现为 `>=0.1.2-alpha.4`；`@deepseek-ai/dsh-web` 放宽为 `>=0.1.2-alpha.2`。所有 `dsh` profile 均已内置这三个包。

**修复 / Fixed**

- **`mapTinyFishResponse` 不再因 TinyFish 畸形响应抛异常。** 缺字符串 `url` 的结果项、非数组 `results`、非字符串的 `title` / `snippet` / `publishedAt` 字段均被跳过/丢弃，不再以被掩盖的 `TypeError` 形式包进无关的 `WEB_PROVIDER_ERROR`（"unprocessable response body"）。一条畸形响应现在退化为零来源。

**新增 / Added**

- **`apply()` 集成测试**，运行在真实 `@deepseek-ai/cordis` 运行时上（`test/apply.test.mjs`）：提供方注册、settings 服务可选性、`installSection` 接线及已提交修改对下一次搜索的生效、凭据解析链（credentials → 启动环境 → process env）、稳定的 `WEB_PROVIDER_CREDENTIAL_MISSING` 错误面。补丁测试现用 js-yaml 真实解析 `cordis.patch.yml`，并按 loader 的按键覆盖 / config 整体替换语义对真实 dsh-base 行做组合断言，取代原先对 YAML 原文的正则匹配。
- **移除死代码**：`declare const process` 垫片（所有环境读取本就经由 `globalThis.process`）。`USER_AGENT` 升至 `dsh-tinyfish-search/0.3.0`。

## [0.2.1] - 2026-09-04

### English

**Compatibility / 兼容性**

- Verified against deepseek-harness `0.1.3-alpha.1` (latest release): no seam changes since `0.1.2-rc.1` — the web seam (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`), the credentials seam, the launch-environment seam, and the settings section install (`ctx.settings.installSection`) are all source-identical between the two tags, as are the vendored `@deepseek-ai/cordis` `4.0.2` and the loader / bundle patch mechanism. 0.1.3's headline changes (environment-proxy support, Session persistence rework, file attachments) do not touch any seam this plugin consumes. The published `@deepseek-ai/dsh-*` type packages remain at `0.1.2-rc.1` (the newest release on npm); because the seam sources are unchanged, type-checking against them is equivalent to checking against `0.1.3-alpha.1` sources. `USER_AGENT` bumped to `dsh-tinyfish-search/0.2.1`. The full test suite passes.

### 中文

**兼容性 / Compatibility**

- 已针对 deepseek-harness `0.1.3-alpha.1`（最新发行版）验证：自 `0.1.2-rc.1` 以来缝接口无任何变更 —— web 缝（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebSearchSource` / `WebError`）、凭据缝、启动环境缝以及设置节安装（`ctx.settings.installSection`）在两个 tag 之间源码完全一致，内置 `@deepseek-ai/cordis` `4.0.2` 与 loader / bundle 补丁机制亦未变化。0.1.3 的主要变更（环境代理支持、Session 持久化重构、文件附件）均不涉及本插件消费的任何缝。npm 上已发布的 `@deepseek-ai/dsh-*` 类型包仍为 `0.1.2-rc.1`（npm 上的最新版本）；由于缝源码未变，针对它们做类型检查与针对 `0.1.3-alpha.1` 源码等价。`USER_AGENT` 升至 `dsh-tinyfish-search/0.2.1`。全部测试通过。

## [0.2.0] - 2026-09-03

### Fixed / 修复

- **Fix: the `tool-web` re-enable row now clears `disabled` explicitly (`disabled: false`).** The loader's id-patch merge is **per-key**: a config-only row restates `config` but leaves the `disabled: true` shipped by the `@deepseek-ai/dsh-web-app` bundle in place, so 0.1.9's re-enable row still left `web_search` unregistered. Verified with `dsh --profile web --dump-config`: the composed `tool-web` row now carries `disabled: false` and the model-facing `web_search` / `web_fetch` tools mount. / **修复：`tool-web` 重启用行现在显式清除 `disabled`（`disabled: false`）。** loader 的按 id 补丁合并是**按键生效**的：仅带 `config` 的行会重述配置但保留 `@deepseek-ai/dsh-web-app` bundle 自带的 `disabled: true`，因此 0.1.9 的重启用行依然让 `web_search` 处于未注册状态。已用 `dsh --profile web --dump-config` 验证：组合后的 `tool-web` 行现为 `disabled: false`，模型可见的 `web_search` / `web_fetch` 工具正常挂载。

## [0.1.9] - 2026-09-03

### Fixed / 修复

- **Fix: the bundle patch now re-enables `tool-web` — without it `web_search` was never registered.** The `@deepseek-ai/dsh-web-app` bundle ships the `tool-web` row **disabled**; dsh-base enables it only in headless/server profiles. The searxng-web bundle re-enables the row in its own patch, but the dsh-tinyfish-search patch did not, so on a clean install into a web profile the model saw no `web_search` tool at all and the TinyFish provider sat idle (devices that appeared to work had a manual `tool-web` override in their profile patch from earlier debugging). The patch now restates the row with `search: true`, `fetch: true`, and the base timeouts, mirroring searxng-web. / **修复：bundle 补丁现重新启用 `tool-web` —— 缺失时 `web_search` 根本不会注册。** `@deepseek-ai/dsh-web-app` bundle 自带 `tool-web` **禁用**行（dsh-base 仅在 headless/server 组合中启用它）。searxng-web 的补丁自己重新启用了该行，而 dsh-tinyfish-search 的补丁没有 —— 干净安装到 web profile 后模型看不到 `web_search` 工具，TinyFish 提供方完全闲置（此前"能用"的设备是因为排障时在 profile 补丁里手工加了 `tool-web` 覆盖行）。现按 searxng-web 的方式补上该行（`search: true`、`fetch: true` 及基础超时值）。
- **Settings hot-reload per the docs** — `apply` now registers the config through `ctx.settings.installSection` (namespace `dsh-tinyfish-search`), exactly like `web-search-deepseek`: the Plugins settings card renders the section, and a saved edit (e.g. a new `apiKeyEnv` or `baseURL`) reaches the next search without a restart. Removed the dead no-op settings probe and its misleading comment. / **按文档接入设置热更新** —— `apply` 现通过 `ctx.settings.installSection` 注册配置（命名空间 `dsh-tinyfish-search`），与 `web-search-deepseek` 完全一致：Plugins 设置卡片可渲染该节，保存的修改（如新的 `apiKeyEnv` 或 `baseURL`）无需重启即对下一次搜索生效。同时删除了无操作死代码及其误导性注释。

## [0.1.8] - 2026-09-03

### English

**Compatibility / 兼容性**

- Verified against deepseek-harness `0.1.2-rc.1` (latest `master`): no seam changes since `0.1.2-alpha.5` (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`, credentials seam, launch-environment seam); the vendored `@deepseek-ai/cordis` `4.0.2` and the loader/bundle patch mechanism are unchanged. Bumped `devDependencies` to `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` at `0.1.2-rc.1` and `USER_AGENT` to `dsh-tinyfish-search/0.1.8`. The full test suite passes against the new package set.

### 中文

**兼容性 / Compatibility**

- 已针对 deepseek-harness `0.1.2-rc.1`（最新 `master`）验证：自 `0.1.2-alpha.5` 以来 web 缝接口（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）、凭据缝与启动环境缝均无变更；内置 `@deepseek-ai/cordis` `4.0.2` 与 loader / bundle 补丁机制亦未变化。`devDependencies` 升级至 `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` `0.1.2-rc.1`，`USER_AGENT` 至 `dsh-tinyfish-search/0.1.8`。全部测试在新区间依赖下通过。

## [0.1.7] - 2026-09-02

### English

**Compatibility / 兼容性**

- Verified against deepseek-harness `0.1.2-alpha.5` (latest `master`): no seam changes since `0.1.2-alpha.4` (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`, credentials seam, launch-environment seam). Bumped `devDependencies` to `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` at `0.1.2-alpha.5` and `USER_AGENT` to `dsh-tinyfish-search/0.1.7`. The full test suite passes against the new package set.

### 中文

**兼容性 / Compatibility**

- 已针对 deepseek-harness `0.1.2-alpha.5`（最新 `master`）验证：自 `0.1.2-alpha.4` 以来 web 缝接口（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）、凭据缝与启动环境缝均无变更；`devDependencies` 升级至 `@deepseek-ai/dsh-web` / `@deepseek-ai/dsh-llm` / `@deepseek-ai/dsh-credentials` / `@deepseek-ai/dsh-launch-environment` `0.1.2-alpha.5`，`USER_AGENT` 至 `dsh-tinyfish-search/0.1.7`。全部测试在新区间依赖下通过。

## [0.1.6] - 2026-09-02

### Fixed / 修复

- **Fix `Search service unavailable` (`WEB_PROVIDER_UNAVAILABLE` / `WEB_PROVIDER_CONFIGURED_UNAVAILABLE`) after harness `0.1.2-alpha.4`.** The provider now resolves the TinyFish API key through the harness credential seam (`ctx.credentials.resolve` + `launchEnvironmentOf(ctx)`) instead of only `process.env`, matching `dsh-web-search-deepseek`. `available()` now mirrors that provider: a resolver being present makes the provider usable, so a missing key surfaces as `WEB_PROVIDER_CREDENTIAL_MISSING` (“set `TINYFISH_API_KEY` / `dsh credentials set` / `apiKey`”) instead of the generic unavailable. `Config.apiKeyEnv` is now `role: 'credential-ref'`. Update `dsh-tinyfish-search` to `0.1.6` and ensure the key is set via `TINYFISH_API_KEY` env or `dsh credentials set TINYFISH_API_KEY <key>`. Verified on harness `0.1.2-alpha.4` with live TinyFish Search (mocked fetch in tests, live fetch manually verified).
- **修复 Harness `0.1.2-alpha.4` 后 `Search service unavailable`（`WEB_PROVIDER_UNAVAILABLE` / `WEB_PROVIDER_CONFIGURED_UNAVAILABLE`）。** 提供方现通过 Harness 凭据缝（`ctx.credentials.resolve` + `launchEnvironmentOf(ctx)`）解析 TinyFish API Key，而非仅 `process.env`，与 `dsh-web-search-deepseek` 保持一致。`available()` 现与该实现一致：只要存在解析器即视为可用，缺失密钥时在 `search()` 阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 明确定位（“请设置 `TINYFISH_API_KEY` / `dsh credentials set` / `apiKey`”），而非通用的 `unavailable`。`Config.apiKeyEnv` 现为 `role: 'credential-ref'`。请升级至 `0.1.6` 并通过 `TINYFISH_API_KEY` 环境变量或 `dsh credentials set` 配置密钥。已在 Harness `0.1.2-alpha.4` 上通过真实 TinyFish Search 验证（测试中 mock fetch，手工真实请求验证）。

## [0.1.5] - 2026-09-02

### English

**Compatibility / 兼容性**

- Verified against deepseek-harness `0.1.2-alpha.4` (latest `master`): `ctx.web` seam unchanged since `0.1.2-alpha.3` (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`). Bumped `devDependencies` to `@deepseek-ai/dsh-web 0.1.2-alpha.4` / `@deepseek-ai/dsh-llm 0.1.2-alpha.4`, `USER_AGENT` to `dsh-tinyfish-search/0.1.5`.
- 已针对 deepseek-harness `0.1.2-alpha.4`（最新 `master`）验证：自 `0.1.2-alpha.3` 以来 `ctx.web` 缝接口（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）无变更；`devDependencies` 升级至 `@deepseek-ai/dsh-web 0.1.2-alpha.4` / `@deepseek-ai/dsh-llm 0.1.2-alpha.4`，`USER_AGENT` 至 `dsh-tinyfish-search/0.1.5`。

**Docs / 文档**

- Added explicit **Usage** and **Uninstall** sections (EN+ZH), completing six-section bilingual coverage: Release / Changelog / Install / Uninstall / Usage / Config. Requirements now notes verified harness `0.1.2-alpha.4`.
- 新增显式**使用**与**卸载**章节（中英双语），补齐六项覆盖：发行版 / 更新说明 / 安装 / 卸载 / 使用 / 配置；环境要求现标明已验证的 `0.1.2-alpha.4`。

## [0.1.4] - 2026-09-01

### English

**Changed / 变更**

- Adapted to DeepSeek Harness **0.1.2-alpha.3** (master): `devDependencies` now pin `@deepseek-ai/dsh-web` and `@deepseek-ai/dsh-llm` at `0.1.2-alpha.3` and `@deepseek-ai/schemastery` moves to `3.18.2` (the schemastery revision the alpha.3 checkout builds against); `@deepseek-ai/cordis` stays at `4.0.2`. Between `0.1.2-alpha.2` and `0.1.2-alpha.3` the `ctx.web` provider contract (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`) and the seam registry are unchanged, so no provider code changes were required; the full test suite passes against the new package set. The request `user-agent` attribution header now reports `dsh-tinyfish-search/0.1.4`.
- 适配 DeepSeek Harness **0.1.2-alpha.3**（master）：`devDependencies` 锁定 `@deepseek-ai/dsh-web`、`@deepseek-ai/dsh-llm` 至 `0.1.2-alpha.3`，`@deepseek-ai/schemastery` 升至 `3.18.2`（alpha.3 检出所依赖的 schemastery 版本）；`@deepseek-ai/cordis` 保持 `4.0.2`。从 `0.1.2-alpha.2` 到 `0.1.2-alpha.3`，`ctx.web` 提供方契约（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）与缝注册表没有变化，因此无需改动提供方代码；全部测试在新区间依赖下通过。请求的 `user-agent` 归属头现在上报 `dsh-tinyfish-search/0.1.4`。

## [0.1.3] - 2026-08-31

### English

**Changed / 变更**

- Adapted to DeepSeek Harness **0.1.2-alpha.2**: `devDependencies` now pin `@deepseek-ai/dsh-web` and `@deepseek-ai/dsh-llm` at `0.1.2-alpha.2` and `@deepseek-ai/cordis` at `4.0.2`, and the `@deepseek-ai/dsh-web` peer range now starts at `0.1.2-alpha.2`. The `ctx.web` provider contract (`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`) is unchanged in this harness release, so no provider code changes were required; the full test suite passes against the new package set. The request `user-agent` attribution header now reports `dsh-tinyfish-search/0.1.3`.
- 适配 DeepSeek Harness **0.1.2-alpha.2**：`devDependencies` 锁定 `@deepseek-ai/dsh-web`、`@deepseek-ai/dsh-llm` 至 `0.1.2-alpha.2`、`@deepseek-ai/cordis` 至 `4.0.2`；`@deepseek-ai/dsh-web` 的 peer 依赖区间下限升至 `0.1.2-alpha.2`。该版 harness 的 `ctx.web` 提供方契约（`WebSearchProvider` / `WebSearchRequest` / `WebSearchResult` / `WebError`）没有变化，因此无需改动提供方代码；全部测试在新区间依赖下通过。请求的 `user-agent` 归属头现在上报 `dsh-tinyfish-search/0.1.3`。

## [0.1.2] - 2026-08-30

### English

**Fixed / 修复**

- The bundle's `cordis.patch.yml` now ships the documented `config` scaffolding on the `dsh-tinyfish-search` row (`apiKey` / `apiKeyEnv` / `baseURL`, all commented out — defaults apply until a later layer overrides the row), matching the README "Configure" example; the patch test guards it.
- bundle 的 `cordis.patch.yml` 现在随包附带 README「配置」一节所示的 `config` 脚手架（`apiKey` / `apiKeyEnv` / `baseURL`，全部为注释示例——在更后层覆盖该行之前均使用默认值），并由 patch 回归测试守护。

**Changed / 变更**

- The request `user-agent` attribution header now reports the package version (`dsh-tinyfish-search/0.1.2`).
- 请求的 `user-agent` 归属头现在上报包版本（`dsh-tinyfish-search/0.1.2`）。

## [0.1.1] - 2026-08-30

### English

**Fixed / 修复**

- **The bundle now actually takes over `web_search`**: the `dsh-base` bundle pins `searchProvider: deepseek-official` on the `web` row, so merely registering the `tinyfish` provider left the built-in tool on the DeepSeek backend (failing against a non-DeepSeek key with "DeepSeek API error (HTTP 404)"). Per the harness layer rules, the bundle patch now overrides the `web` row by id (`searchProvider: tinyfish`, `fetchProvider: http` restated) — installing the plugin switches the built-in `web_search` to TinyFish automatically. Later layers (profile / home `cordis.patch.yml` / `--patch`) can still override the row.
- **修复了插件不生效的问题**:`dsh-base` 把 `web` 行的 `searchProvider` 钉死为 `deepseek-official`,因此仅仅注册 `tinyfish` provider 时,内置 `web_search` 仍走 DeepSeek 后端(用非 DeepSeek 密钥调用即报 "DeepSeek API error (HTTP 404)")。按 harness 的层规则,bundle patch 现在按 id 覆盖 `web` 行(`searchProvider: tinyfish`,并完整重述 `fetchProvider: http`)——安装插件即自动将内置 `web_search` 切换到 TinyFish。更后层(profile / home `cordis.patch.yml` / `--patch`)仍可按 id 覆盖。
- Added a regression test asserting the bundle patch carries the `web` row override.
- 新增回归测试,断言 bundle patch 携带了 `web` 行覆盖。

## [0.1.0] - 2026-08-27

### English

**Added / 功能**

Initial release / 首发版本。

- Register a TinyFish-backed web search provider (`tinyfish`) on the DeepSeek Harness web capability seam (`ctx.web`), so the built-in `web_search` tool queries the TinyFish Search API (`GET https://api.search.tinyfish.ai`) instead of the DeepSeek Anthropic-compatible endpoint.
- 在 DeepSeek Harness 的 web 能力缝（`ctx.web`）上注册 TinyFish 网页搜索提供方（`tinyfish`），使内置 `web_search` 工具改用 TinyFish Search API（`GET https://api.search.tinyfish.ai`），不再走 DeepSeek 的 Anthropic 兼容端点。
- No LLM turn consumed per search — a plain REST GET with the `X-API-Key` header; TinyFish Search is free at any wallet balance.
- 每次搜索不消耗模型调用——普通 REST GET 请求，携带 `X-API-Key` 头；TinyFish Search 任意余额下免费。
- Normalizes `results[]` (title / snippet / url / date) into the seam's portable `WebSearchSource` shape, dedupes by URL, and honors `maxResults` early.
- 将 `results[]`（标题 / 摘要 / 链接 / 日期）归一化为缝接口的 `WebSearchSource` 结构，按 URL 去重，并提前遵守 `maxResults` 上限。
- Config through the bundle patch layer: `apiKey` (secret), `apiKeyEnv` (default `TINYFISH_API_KEY`), `baseURL` (default TinyFish canonical endpoint).
- 支持通过 bundle patch 层配置：`apiKey`（secret 角色）、`apiKeyEnv`（默认 `TINYFISH_API_KEY`）、`baseURL`（默认 TinyFish 官方端点）。
- Stable error mapping on the seam's vocabulary: `WEB_PROVIDER_CREDENTIAL_MISSING`, `WEB_PROVIDER_ERROR`, `WEB_ABORTED`.
- 采用缝接口的错误词表：`WEB_PROVIDER_CREDENTIAL_MISSING`、`WEB_PROVIDER_ERROR`、`WEB_ABORTED`。
- Ships as an installable bundle (`dsh.bundle` + `cordis.patch.yml`): `dsh plugin --profile web add dsh-tinyfish-search`.
- 以可安装 bundle 形式发布（`dsh.bundle` + `cordis.patch.yml`）：`dsh plugin --profile web add dsh-tinyfish-search`。
- Unit tests (node:test, mocked fetch) covering mapping, dedupe, caps, errors, and cancellation.
- 单元测试（node:test，mock fetch），覆盖映射、去重、上限、错误与取消。

**Known limitations / 已知限制**

- Only the seam's `query`/`maxResults` surface is exposed; TinyFish extras (`location`, `language`, `domain_type`, `recency_minutes`, etc.) are not forwarded yet.
- 目前只透出缝接口的 `query` / `maxResults`；TinyFish 的扩展参数（`location`、`language`、`domain_type`、`recency_minutes` 等）暂未透传。
- Config is read once at plugin load; live-setting edits hot-reload the plugin (Cordis HMR) rather than being polled.
- 配置在插件加载时读取一次；运行中改动通过 Cordis HMR 热重载插件生效，而非轮询。

[0.1.6]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.6
[0.1.5]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.5
[0.1.4]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.4
[0.1.3]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.3
[0.1.2]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.2
[0.1.1]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.1
[0.1.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.0