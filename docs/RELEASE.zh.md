# 发行说明 — v0.18.1

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发布日期：2026-10-30

**dsh-tinyfish-search** 0.18.1 仅更正文档。代码、依赖、锁文件与行为契约均无改动：`src/`、`test/` 以及 `package.json` 的依赖字段与 0.18.0 完全一致。

## 修复

- **Requirements 一栏写明了过时的发行版。** 该处把 DeepSeek Harness `0.2.2-alpha.2` 描述为 harness 的「最新发行版」。`0.2.1-rc.5` 于 2026-10-30 发布后，这句话即告失效。二者并非同一条线上的相邻版本：`0.2.2-alpha.2` 属于 `alpha` 线，而 `0.2.1-rc.5` 是从更早的 `0.2.1` 线切出的维护版，**完全不含** `WebSearchProvider.ready()` 契约。该栏现改为指明真正携带该契约的那条线，并说明停留在维护线上的 profile 会遇到什么：插件照常加载与检索，但没有就绪闸门可用，因此凭据缺失时 harness 无法把 `web_search` 收起。
- **中英两侧同时更正。** 英文与中文 README 载有同一处过时表述，已在同一次修改中一并修正，双语对保持对等。

## 为什么是补丁版

- 该表述已经发布出去：npm 上的 `dsh-tinyfish-search@0.18.0` 及其 GitHub Release 都带着这句错误的话，而 npm 包的 README 正是用户在 registry 页面上读到的内容。用一个补丁版把更正后的文本重新发布出去。
- 行为没有任何变化，因此按补丁版而非次版本号递增才诚实。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.18.1`，或让 profile 跟踪最新发行版即可。除此之外无需任何操作：配置字段、取值与默认值均未改动，0.18.0 在所有准入的 harness 版本上本就加载正常。本版升级并非必需，换来的只是更正后的 README 文本。

## 验证

- `node scripts/check-docs-language.ts` 通过，全部双语对零发现。
- `npx tsc -p tsconfig.json --noEmit` 零错误。
- `npm run build` 构建干净；**24** 项单元测试全部通过。
- 另用文档检查器逐对核验：表格列数错位、标题层级跳跃、列表编号断裂、未定义链接引用、中英标点混排、重复词、与 `package.json` 不一致的版本声明，以及双语对之间的结构漂移。两个仓库均报告零发现。
