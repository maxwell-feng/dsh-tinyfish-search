# 发行说明 — v0.18.0

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/docs/RELEASE.md) | 中文

发行日期：2026-10-28

**dsh-tinyfish-search** 0.18.0 完成与 DeepSeek Harness 0.2.2-alpha.2 的对齐，并实现了该版本为 web 提供方契约新增的就绪成员。搜索行为、响应映射、错误映射与全部配置字段均保持原样；本次新增的能力是提供方现在可以告诉宿主「自己有没有可发送的凭据」，于是工具被收起，而不是先出现再失败。

## 新增

- **`WebSearchProvider.ready(llmProvider)`。** `@deepseek-ai/dsh-web` 0.2.2-alpha.2 为两套提供方契约各新增了一个可选的 `ready(llmProvider): Promise<boolean>`，`dsh-tool-web` 把它当作 `web_search` 的激活条件——路由回答 false 的模型步既不声明也不派发该工具。`tinyfish` 提供方按搜索所用的同一套凭据链路作答：存在字面量 `apiKey`，或 `resolveApiKey` 能解出非空值，即为就绪；其余情况均不就绪。该检查只涉及配置，从不访问网络，因此「有值但错误」的密钥同样算作就绪。凭据存储读取时抛错则回答 false，因为同一次读取也会让搜索失败，而不是让搜索找到密钥。TinyFish 对所有模型路由使用同一把密钥，因此 `llmProvider` 从不会改变答案，它仅为符合契约而接收。
- **两项单元测试**锁定该行为：其一走查字面密钥、解析函数、空解析与解析抛错四种情形，且桩替换的 `fetch` 一旦被调用就会让测试失败；其二断言挂载后的插件所注册的提供方仅凭配置即可回答 `ready()`，分别覆盖有、无凭据缝两种情况。

## 变更

- **宿主对齐**：`@deepseek-ai/dsh-*` 的全部开发依赖由 DeepSeek Harness 0.2.1-rc.2 升至 0.2.2-alpha.2，锁文件按 0.2.2-alpha.2 重新生成；`@deepseek-ai/cordis` 升至 `~4.0.6-alpha.1`，`@deepseek-ai/schemastery` 依赖升至 `~3.18.6-alpha.1`。
- **peer 区间放宽**：`@deepseek-ai/cordis` peer 改为 `^4.0.4 || ^4.0.6-alpha.1`，因此仍停留在 cordis 4.0.4 或 4.0.5 的宿主与带 4.0.6-alpha.1 的宿主一样可以准入本插件。
- **供应链豁免清单重建**：工作区文件现对 0.2.2-alpha.2 的各包豁免 pnpm 的最小发布年龄闸门 —— 否则 DSH 持续发布的预发行版会被拦下。该名单保持单一且由锁文件推导的区块。
- **更新请求头标识**：`USER_AGENT` 常量现为 `dsh-tinyfish-search/0.18.0`。
- **兼容性区间保持稳定**：`engines.dsh` 保持 `>=0.1.7-alpha.2 <0.3.0`。插件在 `0.1.7`、`0.2.0`、`0.2.1-rc.2` 与 `0.2.2-alpha.2` 上均无需手动豁免即可准入。
- **源码改动**：`ready()` 与 `USER_AGENT` 版本字符串。`available()`、`search()`、`mapTinyFishResponse` 与全部配置字段均未改动。

## 明确不做

- **不新增 `summary` 与 `content` 透传。** 缝上已有可选的 `WebSearchSource.summary` 与可选的 `WebSearchResult.content`，但两者之所以可选，正是因为并非每个提供方都会返回它们，上游契约更写明适配器不得凭空发明。TinyFish Search API 返回 `position`、`site_name`、`title`、`url`、`snippet` 与 `date`——其他 `domain_type` 下另有少量类型专属字段——但没有长摘要，也没有生成式答案；`src/types.ts` 中同样没有对应字段。因此本版不做任何映射。

## 文档

- 全部双语文档的验证基线更新为 `0.2.2-alpha.2` / 插件 `0.18.0`。
- README、CONFIG、INSTALL、UPDATE、USAGE、UNINSTALL 与 CHANGELOG 均按两种语言同步更新，两侧描述同一套就绪行为与同一套升级步骤。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.18.0`，或让 profile 跟踪最新发行版即可。无需任何手工步骤：配置字段、取值与默认值均未改动。本版**并非强制升级**——`0.17.1` 在 DeepSeek Harness 0.2.2-alpha.2 上本就可加载。

## 验证

- `npx tsc -p tsconfig.json --noEmit` 零错误、`npm run build` 构建干净，**24** 项单元测试在 DeepSeek Harness 0.2.2-alpha.2 的各包上全部通过。
- `node scripts/check-docs-language.ts` 检查全部通过，零发现。
- 未验证项：在真实 `0.2.2-alpha.2` profile 中的实际启动并端到端触发就绪闸门；以及真实的 TinyFish API 请求（测试套件对 `fetch` 做了桩替换）。
