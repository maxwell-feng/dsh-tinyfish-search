# 发行说明 — v0.20.0

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发布日期：2026-11-12

**dsh-tinyfish-search** 0.20.0 完成与 DeepSeek Harness `0.2.2-rc.2` 的对齐，并新增了 0.2.2-rc.2 提供方选择器读取的 `title`/`description` 元数据。除 `USER_AGENT` 版本字符串与 `test/apply.test.ts` 中对应的断言外，唯一的源码改动是 `TinyFishSearchProvider` 上新增的 `title`/`description` 对；搜索提供方、其就绪闸门与全部配置字段均未改动。

## 变更

- **宿主对齐。** `@deepseek-ai/dsh-*` 的全部开发依赖由 `0.2.2-rc.1` 升至 `0.2.2-rc.2`，锁文件按 0.2.2-rc.2 重新生成（`@deepseek-ai/cordis` 保持 `~4.1.0`，`@deepseek-ai/schemastery` 保持 `~3.19.0`）。
- **提供方选择器元数据。** `TinyFishSearchProvider` 声明了 `dsh-web` 在 0.2.2-rc.2 新增的可选 `title`（`TinyFish Search`）与 `description` 成员，Web 搜索提供方菜单因此可显示友好名称与简短说明，而不再只是裸的 `tinyfish` id。这两个成员在缝上均为可选，因此在尚未读取它们的更早宿主上插件仍可加载。
- **双线验证。** 构建基线为 `0.2.2-rc.2`（2026-11-11 发布于 npm 的 `next` 标签）；插件另在 `0.2.2-rc.1`（npm `latest` 标签）上验证通过。两条线均报告 typecheck 零错误、build 干净、**24** 项单元测试全部通过。
- **peer 区间不变。** `@deepseek-ai/cordis` peer 保持 `^4.0.4 || ^4.0.6-alpha.1`；`engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`，因此本版**不是**强制升级——0.19.0 在 `0.2.2-rc.2` 上照旧加载。
- **供应链闸门。** 工作区文件将 0.2.2-rc.2 包集合排除在 pnpm 的最低发布年龄闸门之外；清单仍是单一、由锁文件派生的块。
- **更新请求头标识。** `USER_AGENT` 更新为 `dsh-tinyfish-search/0.20.0`。

## 文档

- 接管说明与回退说明均正确写出基础搜索默认值：`deepseek-search-api`（0.2.2-rc.2 起；更早为 `deepseek-official`），因此移除 bundle 层后 `web_search` 会回退到 DeepSeek Search API。
- 中英双语文档的验证基线现为 `0.2.2-rc.2` / 插件 `0.20.0`，并记录 `0.2.2-rc.1` 为第二验证线。

## 新宿主上的 Node 门槛

`0.2.2-rc.2` 维持 harness 自身的最低 Node.js 为 **24.9**。本插件的 `engines.node` 保持 `^22.19.0 || >=24.0.0` 不变，但在 `0.2.2-rc.2` 宿主上由更严格的宿主规则决定，因此该处的实际要求是 Node 24.9+。插件本身无需为此做任何改动；文档写明这一点，只是为了避免该要求成为意外。

`WebSearchProvider.search()`、`ready()` 及其激活契约在 `0.2.2-rc.1` 与 `0.2.2-rc.2` 之间未变，因此 0.18.0 引入的就绪闸门在新基线上继续有效。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.20.0`，或让 profile 跟踪最新发行版即可。除此之外无需任何操作：配置字段、取值与默认值均未改动，且本版升级并非必需——0.19.0 在 `0.2.2-rc.2` 上本就加载正常。仍停留在 `0.2.2-rc.1` 的宿主也照旧可用，因为 `engines.dsh` 接纳整条 `0.2.x` 线。

## 验证

- `node scripts/check-docs-language.ts` 通过，全部双语对零发现。
- `npx tsc -p tsconfig.json --noEmit` 零错误。
- `npm run build` 构建干净；**24** 项单元测试在 DeepSeek Harness 0.2.2-rc.2 上全部通过，并在 0.2.2-rc.1 上复测通过。
- 另对全部文档对逐项审计：表格列数错位、标题层级跳跃、列表编号断裂、未定义链接引用、中英标点混排、重复词，以及双语对之间的结构漂移，均为零发现。
- 未验证项：在真实 `0.2.2-rc.2` profile 中的实际启动并端到端触发就绪闸门；以及真实的 TinyFish API 请求（测试套件对 `fetch` 做了桩替换）。
