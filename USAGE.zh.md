# 使用指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/USAGE.md) | 中文

当前插件版本：`0.23.0`。构建基线：DeepSeek Harness `0.2.3-alpha.2`；Node.js `^24.22.3 || >=26.13.1`。

## 搜索流转路径

在组合了本 bundle 的 profile 中，模型在会话里按常调用 `web_search`。框架经 web 缝把调用路由到本插件：

```text
model → web_search → ctx.web → tinyfish → GET https://api.search.tinyfish.ai
```

一次搜索就是一次 HTTP 请求：

```text
GET https://api.search.tinyfish.ai/?query=hello+world&location=US&language=en
x-api-key: <your TinyFish key>
user-agent: dsh-tinyfish-search/0.23.0
accept: application/json
```

仅在配置了 `location` 与 `language` 时才发送它们。否则请求只带 `query`。每次搜索不消耗模型调用。

## 提供方

bundle 补丁组合三行：插件自身行，以及两条宿主行覆盖。

| 行 | 作用 |
|---|---|
| `dsh-tinyfish-search` | 插入插件行并注册 `tinyfish` 提供方 |
| `web` | 把缝指向本提供方：`searchProvider: tinyfish`（重述 `fetchProvider: http`） |
| `tool-web` | 重新启用宿主面向模型的工具：`disabled: false`、`search: true`、`fetch: true`，并重述超时值 |

提供方以稳定 ID `tinyfish`（`TINYFISH_PROVIDER_ID`）注册。配置表单以 profile 行 id `dsh-tinyfish-search` 为键；DSH 从行 id 推导命名空间。

`available()` 是本地检查：存在字面量密钥或已配置凭据解析器，且 `baseURL` 可解析。它不会调用解析器。它不产生网络请求。带凭据解析器的提供方即使密钥尚未配置也可被选中，因此缺密钥时在搜索阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 报错，而不会表现为“不可用”。

从 DeepSeek Harness 0.2.2 起，提供方还实现了 `ready(llmProvider)`，用于回答：为该聊天路由上的模型请求发起搜索时，有没有可用的凭据。`dsh-tool-web` 把它当作 `web_search` 的激活条件，因此未配置凭据时，模型步不会被提供该工具，缺密钥也不会变成一次失败的调用。与 `available()` 一样，它只涉及配置、不访问任何服务；不同之处在于它会解析密钥，解不到就回答 `false`。TinyFish 在所有模型路由上使用同一个密钥，因此 `llmProvider` 从不改变答案。

按预设限定范围：宿主 `tool-web` 行让工具对本 profile 上的每个 agent 预设可见。自带 `tool-web` 行的预设会用自身注册遮蔽这个全局注册。若只想限定到单个预设，请在 profile 的 `cordis.patch.yml` 中覆盖或移除 `tool-web` 行，并把 `tool-web` 加入该预设的组合。

## 凭据配置

每次搜索按以下顺序解析 API key，以第一个非空值为准：

1. 插件配置中的字面量 `apiKey`（secret 角色，避免提交到仓库）。
2. 凭据服务：`ctx.credentials.resolve(apiKeyEnv)`。
3. 启动环境：`launchEnvironmentOf(ctx).get(apiKeyEnv)`。
4. `process.env[apiKeyEnv]`，用于宿主之外的独立使用。

`apiKeyEnv` 默认为 `TINYFISH_API_KEY`，角色为 `credential-ref`，因此渲染出的表单会显示凭据引用。已提交的表单修改对下一次搜索生效，无需重启。

推荐只配置环境变量：

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # 仅当前 shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # 永久生效（bash）
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # 永久生效（zsh）
source ~/.bashrc                                                 # 或重开终端
```

Windows PowerShell 可用 `setx TINYFISH_API_KEY "your_api_key_here"` 对新终端生效，或用 `$env:TINYFISH_API_KEY = "your_api_key_here"` 仅对当前会话生效。

## 示例

### 会话内搜索

```text
What is today's weather in Tokyo?
```

模型调用 `web_search`，框架把它路由到 TinyFish，工具结果携带归一化来源。在 GUI 中打开 **插件 → 内置插件配置 → 网页搜索与获取**，**网页搜索提供方** 下拉框会列出 **TinyFish Search**（id `tinyfish`）。

### 归一化结果结构

`results[]` 条目映射为缝的 `WebSearchSource` 结构，按 URL 去重，并提前按 `maxResults` 截断。`truncated` 为 `false`，最终截断标记由 web 缝设定。`date` 与 `publishedAt` 都汇入 `publishedAt`，空字段省略。

```js
import { mapTinyFishResponse } from 'dsh-tinyfish-search'

const out = mapTinyFishResponse({
  query: 'TinyFish docs',
  results: [
    { position: 1, site_name: 'TinyFish', title: 'Search API', snippet: 'One GET per query.', url: 'https://docs.tinyfish.ai/search-api', date: '2026-09-01' },
    { position: 2, title: 'dup', url: 'https://docs.tinyfish.ai/search-api' },
  ],
}, 5)
console.log(JSON.stringify(out, null, 2))
```

```json
{"sources": [{"url": "https://docs.tinyfish.ai/search-api", "title": "Search API", "snippet": "One GET per query.", "publishedAt": "2026-09-01"}], "truncated": false}
```

重复 URL 被丢弃。TinyFish 不返回长摘要，也不返回生成式答案，因此插件既不为 `WebSearchSource.summary` 也不为 `WebSearchResult.content` 填值。两者在缝上都是可选的。

### 地区与语言定向

```yaml
- id: dsh-tinyfish-search
  config:
    location: US
    language: en
```

这会发送 `?query=...&location=US&language=en`。留空或未设置则不发送。

## 错误与取消

| 错误码 | 触发时机 | 处理方法 |
|---|---|---|
| `WEB_PROVIDER_CREDENTIAL_MISSING` | 所有来源都无密钥 | 设置 `TINYFISH_API_KEY`、经凭据服务存储密钥，或设置字面量 `apiKey` |
| `WEB_PROVIDER_ERROR` | HTTP 错误，或无法解析的成功响应体；HTTP 错误时保留上游返回的信息（若有） | 检查密钥、端点与网络 |
| `WEB_ABORTED` | 调用方取消了搜索 | 如仍需要可重试 |

缺密钥的报错会点名所配置的变量：`dsh-tinyfish-search has no API key for "TINYFISH_API_KEY"; set the environment variable, store it through the credentials service, or set a literal "apiKey" in the dsh-tinyfish-search config`。

TinyFish 畸形响应（非数组 `results`、条目缺少字符串 `url`）退化为零来源，不抛异常。

`WEB_PROVIDER_CREDENTIAL_MISSING` 来自已派发的搜索。走常规模型路径时，`ready()` 会先收起工具，因此该错误通常只出现在绕过闸门的程序化调用中。
