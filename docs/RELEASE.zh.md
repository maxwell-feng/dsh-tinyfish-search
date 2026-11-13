# 发行说明 — v0.21.0

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发布日期：2026-11-13

**dsh-tinyfish-search** 0.21.0 完成与 DeepSeek Harness `0.2.2-rc.3` 的对齐。本版只更新依赖：API、配置字段与搜索行为均未改变。

## 变更

- `@deepseek-ai/dsh-*` 的全部开发依赖由 `0.2.2-rc.2` 移至 `0.2.2-rc.3`。
- 锁文件与工作区供应链豁免清单按该包集合刷新。
- `USER_AGENT` 更新为 `dsh-tinyfish-search/0.21.0`，对应测试断言同步更新。
- `engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`。插件仍兼容 `0.2.2-rc.2` 及更早的 `0.2.x` 版本，因此升级是可选的。
- DeepSeek Harness 0.2.2-rc.3 没有影响插件的破坏性变更。其发行说明新增了实验性的 DeepSeek 对话导入插件，并修复了 Windows 桌面更新问题。

## 验证

- `pnpm test`：24 项测试通过。
- `pnpm typecheck`：零错误。
- `pnpm build`：在 DeepSeek Harness 0.2.2-rc.3 上构建干净。
- 未进行真实 profile 启动。

## 升级

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.21.0
```

无需修改配置。
