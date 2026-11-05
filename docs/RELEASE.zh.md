# 发行说明 — v0.19.0

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发布日期：2026-11-05

**dsh-tinyfish-search** 0.19.0 完成与 DeepSeek Harness `0.2.2-rc.1` 的对齐，并删除了一条陈旧的依赖 override。除 `USER_AGENT` 版本字符串与 `test/apply.test.ts` 中对应的断言外，插件源码未改动：`src/`、`scripts/`、`locale/`、`.github/`、`cordis.patch.yml` 与 `tsconfig*.json` 其余部分与 0.18.1 完全一致。

## 变更

- **宿主对齐。** `@deepseek-ai/dsh-*` 的全部开发依赖由 `0.2.2-alpha.2` 升至 `0.2.2-rc.1`，锁文件按 0.2.2-rc.1 重新生成；`@deepseek-ai/cordis` 由 `~4.0.6-alpha.1` 升至 `~4.1.0`，`@deepseek-ai/schemastery` 依赖由 `~3.18.6-alpha.1` 升至 `~3.19.0`。
- **双线验证。** 构建基线为 `0.2.2-rc.1`（2026-11-04 发布于 npm 的 `next` 标签）；插件另在 `0.2.1-rc.5`（npm `latest` 标签、桌面版运行时）上验证通过。两条线均报告 typecheck 零错误、build 干净、**24** 项单元测试全部通过。
- **peer 区间不变。** `@deepseek-ai/cordis` peer 保持 `^4.0.4 || ^4.0.6-alpha.1`：`^4.0.4` 本就覆盖 `4.1.0`，无需改动区间。`engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`，因此本版**不是**强制升级——0.18.1 在 `0.2.2-rc.1` 上照旧加载。
- **更新请求头标识。** `USER_AGENT` 更新为 `dsh-tinyfish-search/0.19.0`。

## 修复

- **一条陈旧的 `@deepseek-ai/cosmokit` override 与 cordis 的声明相冲突。** `pnpm-workspace.yaml` 自 2026-08-30 首版起就带着 `overrides: '@deepseek-ai/cosmokit': 1.8.7-alpha.1`。cordis `4.1.0` 声明要求 `@deepseek-ai/cosmokit: ~1.9.0`，因此这条 override 把依赖树强行钉在声明所排除的版本上——依赖声明与实际解析不一致。0.19.0 删除了该 override，锁文件现按 cordis 的声明解析 cosmokit `1.9.0`。cosmokit `1.8.7-alpha.1` 与 `1.9.0` 除各自的 `package.json` 外字节完全相同，这正是历史上从未引发运行时故障的原因；该不一致是潜在缺陷而非无害差异，本次予以修正。

## 新宿主上的 Node 门槛

`0.2.2-rc.1` 把 harness 自身的最低 Node.js 提升到 **24.9**。本插件的 `engines.node` 保持 `^22.19.0 || >=24.0.0` 不变，但在 `0.2.2-rc.1` 宿主上由更严格的宿主规则决定，因此该处的实际要求是 Node 24.9+。插件本身无需为此做任何改动；文档写明这一点，只是为了避免该要求成为意外。

`WebSearchProvider.ready()` 及其激活契约在 `0.2.2-alpha.2` 与 `0.2.2-rc.1` 之间未变，因此 0.18.0 引入的就绪闸门在新基线上继续有效。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.19.0`，或让 profile 跟踪最新发行版即可。除此之外无需任何操作：配置字段、取值与默认值均未改动，且本版升级并非必需——0.18.1 在 `0.2.2-rc.1` 上本就加载正常。仍停留在 `0.2.1-rc.5` 的宿主也照旧可用，因为 `engines.dsh` 接纳整条 `0.2.x` 线。

## 验证

- `node scripts/check-docs-language.ts` 通过，全部双语对零发现。
- `npx tsc -p tsconfig.json --noEmit` 零错误。
- `npm run build` 构建干净；**24** 项单元测试在 DeepSeek Harness 0.2.2-rc.1 上全部通过，并在 0.2.1-rc.5 上复测通过。
- 另对全部文档对逐项审计：表格列数错位、标题层级跳跃、列表编号断裂、未定义链接引用、中英标点混排、重复词，以及双语对之间的结构漂移，均为零发现。
- 未验证项：在真实 `0.2.2-rc.1` profile 中的实际启动并端到端触发就绪闸门；以及真实的 TinyFish API 请求（测试套件对 `fetch` 做了桩替换）。
