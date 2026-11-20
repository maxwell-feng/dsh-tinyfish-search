# 发行说明 — v0.22.0

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发布日期：2026-11-20

**dsh-tinyfish-search** 0.22.0 完成与 DeepSeek Harness `0.2.2-rc.5` 的对齐。本版为依赖与文档更新：API、配置字段与搜索行为均未改变。

## 变更

- `@deepseek-ai/dsh-*` 的全部开发依赖由 `0.2.2-rc.3` 移至 `0.2.2-rc.5`。
- 锁文件与工作区供应链豁免清单按该包集合刷新。
- `USER_AGENT` 更新为 `dsh-tinyfish-search/0.22.0`，对应测试断言同步更新。
- 文档现已说明 `0.2.2-rc.5` 的搜索提供方变更：基础组合不再设置 `searchProvider`，改由 `dsh-web` 在 DeepSeek 模型路由上选择旧版 Messages 搜索、在其他路由上选择 DeepSeek Search API。bundle 补丁仍设置 `searchProvider: tinyfish`，因此继续覆盖该自动选择，搜索行为不变。
- 卸载与更新指南按宿主版本线写明回退行为，并说明依赖宿主级 `tool-web` 行的预设会失去 `web_search`。`allow-version` 示例已补上必需的 `--profile`。
- `engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`。插件仍兼容 `0.2.2-rc.4` 及更早的 `0.2.x` 版本，因此升级是可选的。

## 验证

- `pnpm test`：24 项测试通过。
- `pnpm typecheck`：零错误。
- `pnpm build`：在 DeepSeek Harness 0.2.2-rc.5 上构建干净。
- 未进行真实 profile 启动。

## 升级

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.22.0
```

无需修改配置。
