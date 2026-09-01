# Changelog / 更新说明

All notable changes to this project are documented here / 本项目的所有重要变更均记录于此。
The format follows [Keep a Changelog](https://keepachangelog.com/) / 格式遵循 [Keep a Changelog](https://keepachangelog.com/)。

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