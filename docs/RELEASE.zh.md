# 发行说明 — v0.23.0

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发布日期：2026-11-24

**dsh-tinyfish-search** 0.23.0 完成与 DeepSeek Harness `0.2.3-alpha.2`（2026-11-22 发布）的对齐。本版为依赖、Node.js 门槛与文档更新：API、配置字段与正常搜索行为均未改变。`mapTinyFishResponse` 现在会把 null 响应或 null 结果项退化为零来源，而不是抛出异常。

## 变更

- 全部 `@deepseek-ai/dsh-*` 开发依赖由 `0.2.2-rc.5` 移至 `0.2.3-alpha.2`。
- `@deepseek-ai/cordis` 升至 `4.2.0-alpha.1`，`@deepseek-ai/schemastery` 升至 `3.20.0-alpha.1`；peer 与依赖区间接纳 0.2.3 线，同时仍接纳更早的 0.2.x 宿主。
- `engines.node` 现与 DSH 0.2.3 一致：`^24.22.3 || >=26.13.1`。CI 与发布任务固定使用 Node.js 24.22.3。
- `USER_AGENT` 更新为 `dsh-tinyfish-search/0.23.0`，对应测试断言同步更新。
- `engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`。
- 锁文件与工作区供应链豁免清单按 `0.2.3-alpha.2` 包集合刷新。

## 文档

- README、INSTALL、CONFIG、UPDATE、USAGE、UNINSTALL 与两篇发行说明现已标明插件版本 `0.23.0`、`0.2.3-alpha.2` 基线，并在相关位置写明 Node.js 门槛。
- 插件管理器中该插件的标题改为句首大写，两语言说明均写明需要 TinyFish API key。
- 修正中文补丁说明中的“否则”从句、web 缝主语句和 Node.js 门槛句式；把“检查层是否组合”改为“检查 bundle 层是否已组合”，并统一“配置行”“以第一个非空值为准”和“bundle 层”的表述。
- 把过时的“设置 → 网页搜索 / `available: true`”验证步骤改为 0.2.3 的实际路径 **插件 → 网页搜索与获取** 与提供方显示名，并写明补丁的三行结构。
- CONFIG、USAGE、UNINSTALL 增加当前插件版本与基线说明；中文更新日志不再使用与英文不同的分隔线样式。

## 验证

- `pnpm typecheck`：零错误。
- `pnpm build`：在 DeepSeek Harness 0.2.3-alpha.2 上构建干净。
- `pnpm test`：24 项测试通过。
- `node scripts/check-docs-language.ts`：通过。
- 未做真实 profile 启动，也未发起真实 TinyFish 请求。

## 升级

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.23.0
```

API 与配置均未改变。使用 Node.js 24.9 的 0.2.2 宿主可继续使用 0.22.0；升级到 DSH 0.2.3-alpha.2 或满足新 Node.js 门槛后再安装 0.23.0。
