# 发行说明 — v0.16.0

[英文](RELEASE.md) | 中文

发行日期：2026-10-16

**dsh-tinyfish-search** 0.16.0 完成与 DeepSeek Harness 0.2.1-alpha.4 的对齐——即本插件所遵循的插件开发文档的最新发行版。提供方逻辑未变：`ctx.web` 搜索提供方契约在 0.2.1-alpha.2 与 0.2.1-alpha.4 之间源码完全一致，因此本次仅移动了锁定的开发依赖、锁文件、工作区供应链豁免清单与 `USER_AGENT` 版本字符串。

## 变更

- **宿主对齐**：`@deepseek-ai/dsh-*` 的全部开发依赖由 DeepSeek Harness 0.2.1-alpha.2 升至 0.2.1-alpha.4，锁文件按 0.2.1-alpha.4 重新生成；`@deepseek-ai/cordis` 保持 `^4.0.4`、`@deepseek-ai/schemastery` 保持 `^3.18.4`。
- **供应链豁免清单重建**：工作区文件现对 0.2.1-alpha.4 的各包豁免 pnpm 的最小发布年龄闸门 —— 否则 DSH 持续发布的预发行版会被拦下。此前的名单还带有第二个 `minimumReleaseAgeExclude` 键，其过期的 `0.2.0-rc.2` 条目会让 pnpm 拒绝重新生成的锁文件；该名单现为单一且由锁文件推导的区块。
- **更新请求头标识**：`USER_AGENT` 常量现为 `dsh-tinyfish-search/0.16.0`。
- **兼容性区间保持稳定**：peer 依赖区间保持 `>=0.1.7-alpha.2 <0.3.0`。插件在 `0.1.7`、`0.2.0` 与 `0.2.1-alpha.4` 上均无需手动豁免即可准入。
- **源码改动**：除 `USER_AGENT` 版本字符串外无改动。`registerSearchProvider`、`WebSearchProvider`、`WebSearchRequest`、`WebSearchResult` 与 `WebError` 均未变动，因此配置字段没有迁移、请求形态也没有变化。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.16.0`，或让 profile 跟踪最新发行版即可。无需任何手工步骤：配置字段、取值与默认值均未改动。本版**并非强制升级**——`0.15.0` 在 DeepSeek Harness 0.2.1-alpha.4 上本就可加载。

## 验证

- 类型检查与构建均干净，**22** 项单元测试在 DeepSeek Harness 0.2.1-alpha.4 的各包上全部通过。
- `node scripts/check-docs-language.ts` 检查全部通过，零发现。
- 未验证项：在真实 `0.2.1-alpha.4` profile 中的实际启动；以及真实的 TinyFish API 请求（测试套件对 `fetch` 做了桩替换）。
