# 使用说明文档 (Usage Guide)

[English](USAGE.md) | 简体中文

> 已在 DeepSeek Harness **0.1.5-rc.1** 上随 `dsh-tinyfish-search` **0.5.0** 完成全面验证。下文所有线路输出均取自已构建的 `lib/` 产物实测。

本文档说明搜索在本插件中的流转路径、涉及的提供方、凭据解析顺序与错误形态，并附可运行示例。

---

## 1. 搜索流转路径

在组合了本 bundle 的 profile 的任意会话中，模型按常调用 `web_search` 即可。框架经 web 能力缝把调用路由到本插件的提供方：

```text
model → web_search → ctx.web → tinyfish → GET https://api.search.tinyfish.ai
```

具体而言，一次搜索就是一次 HTTP 请求（已对构建产物实测验证）：

```text
GET https://api.search.tinyfish.ai/?query=hello+world&location=US&language=en
x-api-key: <your TinyFish key>
user-agent: dsh-tinyfish-search/0.5.0
accept: application/json
```

仅在配置了 `location` / `language` 时才发送它们；否则请求只带 `query`。每次搜索不消耗模型调用。

---

## 2. 提供方说明

bundle 补丁组合了两行，决定哪个后端真正应答：

| 行 | 作用 |
|---|---|
| `web` | 把能力缝指向本提供方：`searchProvider: tinyfish`（并重述 `fetchProvider: http`） |
| `tool-web` | 重新启用宿主层面向模型的工具（`disabled: false`、`search: true`、`fetch: true`，并重述超时值） |

提供方以稳定 ID `tinyfish`（`TINYFISH_PROVIDER_ID`）注册，设置节命名空间为 `dsh-tinyfish-search`（`TINYFISH_SETTINGS_NAMESPACE`）。`available()` 是廉价的本地检查——密钥存在（或可解析）且 `baseURL` 可解析——不产生任何网络请求。带凭据解析器的提供方即使密钥尚未就绪也视为可用，因此缺密钥时在搜索阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 明确报错，而不会表现为“不可用”。

按预设限定范围：宿主 `tool-web` 行让工具对本 profile 上的每一个 agent 预设可见。自带 `tool-web` 行的预设会以自己的注册遮蔽这个全局注册。若希望把工具限定在单个预设内，请在 profile 的 `cordis.patch.yml` 中覆盖或移除 `tool-web` 行，并把 `tool-web` 加入该预设的 agent 组合。

---

## 3. 凭据配置

每次搜索按以下顺序解析 API key（第一个非空值获胜）：

1. 插件配置中的字面量 `apiKey`（secret 角色——建议不要提交到仓库）。
2. 凭据服务：`ctx.credentials.resolve(apiKeyEnv)`。
3. 启动环境：`launchEnvironmentOf(ctx).get(apiKeyEnv)`。
4. `process.env[apiKeyEnv]`（覆盖宿主之外的独立使用场景）。

`apiKeyEnv` 默认为 `TINYFISH_API_KEY`，携带 `credential-ref` 角色，设置界面会提供凭据选择器。已提交的设置修改（新密钥、新 `baseURL`、新定向参数）无需重启即对下一次搜索生效。

推荐配置——只需环境变量，无需改动 YAML：

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # 仅当前 shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # 永久生效（bash）
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # 永久生效（zsh）
source ~/.bashrc                                                 # 或重开终端
```

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # 永久生效——新开的终端生效
$env:TINYFISH_API_KEY = "your_api_key_here"  # 仅当前会话生效
```

---

## 4. 示例

### 4.1 会话内搜索

直接提问需要实时信息的问题：

```text
What is today's weather in Tokyo?
```

模型调用 `web_search`，框架把它路由到 TinyFish，工具结果携带归一化来源。密钥配置好后，GUI 的**设置 → 网页搜索**显示提供方 `tinyfish` 与 `available: true`。

### 4.2 归一化结果结构

`results[]` 条目映射为缝接口的可移植 `WebSearchSource` 结构：按 URL 去重、提前按 `maxResults` 截断、`truncated: false`（最终截断标记归 web 服务所有）。`date` / `publishedAt` 都汇入 `publishedAt`；空字段直接省略。已用发布构建实测验证：

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
{
  "sources": [
    {
      "url": "https://docs.tinyfish.ai/search-api",
      "title": "Search API",
      "snippet": "One GET per query.",
      "publishedAt": "2026-09-01"
    }
  ],
  "truncated": false
}
```

重复 URL 被丢弃；第二条没有带来任何新信息。

### 4.3 地区 / 语言定向

```yaml
- id: dsh-tinyfish-search
  config:
    location: US
    language: en
```

将发送 `?query=...&location=US&language=en`（已实测）。留空或未设置则不发送——默认线路格式只带 `query`。

---

## 5. 错误与取消

| 错误码 | 触发时机 | 处理方法 |
|---|---|---|
| `WEB_PROVIDER_CREDENTIAL_MISSING` | 所有来源都无密钥 | 设置 `TINYFISH_API_KEY`、经凭据服务存储，或设置字面量 `apiKey` |
| `WEB_PROVIDER_ERROR` | HTTP 错误或不可解析的响应体（保留 TinyFish 原始信息） | 检查密钥、端点与网络 |
| `WEB_ABORTED` | 调用方取消了搜索 | 如仍需要可重试 |

缺密钥的报错会点名所配置的变量（已实测）：

```text
dsh-tinyfish-search has no API key for "TINYFISH_API_KEY"; set the environment variable, store it through the credentials service, or set a literal "apiKey" in the dsh-tinyfish-search config
```

TinyFish 畸形响应（非数组 `results`、缺字符串 `url` 的条目）退化为零来源，不抛异常。
