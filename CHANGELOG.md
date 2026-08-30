# Changelog / 更新说明

All notable changes to this project are documented here / 本项目的所有重要变更均记录于此。
The format follows [Keep a Changelog](https://keepachangelog.com/) / 格式遵循 [Keep a Changelog](https://keepachangelog.com/)。

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

[0.1.0]: https://github.com/maxwell-feng/dsh-tinyfish-search/releases/tag/v0.1.0