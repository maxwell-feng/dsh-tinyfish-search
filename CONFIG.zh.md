# 配置指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/CONFIG.md) | 中文

当前插件版本：`0.23.0`。构建基线：DeepSeek Harness `0.2.3-alpha.2`；Node.js `^24.22.3 || >=26.13.1`。

## 配置字段

插件用 `@deepseek-ai/schemastery` 导出 `Config` schema；Host 在 **插件** 页面据此渲染 `dsh-tinyfish-search` 表单。所有字段均可选，且均标记 `.volatile()`。

| 字段 | 类型 | 默认值 | 角色 | 含义 |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | 字面量 API key。建议留空并优先用 `apiKeyEnv`，避免密钥写进配置文件。 |
| `apiKeyEnv` | `string` | `TINYFISH_API_KEY` | `credential-ref` | 承载 API key 的环境变量名。 |
| `baseURL` | `string` | `https://api.search.tinyfish.ai` | 普通 | API 端点基地址。必须使用 `http:` 或 `https:`。本机与私网 IP 会被拒绝。 |
| `location` | `string` | `undefined` | 普通 | 可选地区定位（如 `US`、`CN`），转发给 TinyFish。 |
| `language` | `string` | `undefined` | 普通 | 可选搜索语言（如 `en`、`zh`），转发给 TinyFish。 |

默认值在 schema 上，渲染表单与插件取值一致。

## 配置值的生效路径

DSH 0.1.7 用 schema 驱动配置取代旧设置缝。

声明：`src/config.ts` 导出 `Config`，`src/index.ts` 再导出。Host 读取 `entry.fiber.runtime.Config`；命名空间取 profile 行 id `dsh-tinyfish-search`，不由插件决定。
逐字段活引用：`apply(ctx, config)` 为每个字段收到 `Volatile<T>`；没有 `ctx.inject(['settings'])`，也没有注册调用。
每次搜索一个快照：提供方在搜索开始时读取五个字段的 `.get()`，单次搜索不会混用保存前后的值。
写入：**插件** 页面表单经 `ctx.configForms.get(entryId)` 写入 `ConfigForm`（`getSnapshot`、`subscribe`、`set`、`unset`、`mutate`、`dispose`）。写入按修订号保护；被拒绝返回 `false` 并重载宿主状态。
- 生效：已提交的修改对下一次搜索生效，无需重启或重新注册。

程序化构造接受已完成的 `TinyFishOptions`、快照对象或返回 `TinyFishOptions` 的 thunk（`TinyFishProviderInput`）；只有插件路径传 thunk。

## 推荐配置：环境变量

```sh
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

无需改 YAML；插件每次搜索解析凭据。

## Profile 静态配置

在 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 中添加覆盖项：

```yaml
- id: dsh-tinyfish-search
  config:
    apiKeyEnv: TINYFISH_API_KEY
    baseURL: https://api.search.tinyfish.ai
    location: US
    language: en
```

行的 `id` 即配置表单的寻址键；重命名行会重命名其命名空间。

## 网页界面配置

1. 从侧栏打开 **插件**。
打开 **TinyFish 网页搜索** bundle，再打开其 **`dsh-tinyfish-search`** 行。保存后无需重启。

表单由 Host 按 schema 渲染；插件不提供浏览器代码。

## 凭据解析顺序

每次搜索按以下顺序取第一个非空值：

1. 插件配置中的字面量 `apiKey`。
2. 凭据服务：`ctx.credentials.resolve(apiKeyEnv)`。
3. 启动环境：`launchEnvironmentOf(ctx).get(apiKeyEnv)`。
4. `process.env[apiKeyEnv]`，用于宿主之外的独立使用。

带解析器的提供方即使未存密钥也视为 `available`；缺密钥时在搜索阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 报错，并点名所配置的变量。错误表见[使用说明](USAGE.zh.md)。

## 就绪判定（`ready()`）

DSH 0.2.2 为 `WebSearchProvider` 增加可选 `ready(llmProvider): Promise<boolean>`；`dsh-tool-web` 用它激活 `web_search`：`ready()` 返回 `false` 的模型步不获得工具。`tinyfish` 按上述链解析并报告是否找到密钥：

- 存在字面量 `apiKey` 时立即就绪。否则运行一次解析器。
解析出非空值即就绪；空字符串及其他值均不就绪。
凭据存储读取时抛错则回答 `false`，因为同一次读取也会让搜索失败。
该检查只涉及配置：不访问 TinyFish，也不校验密钥，因此有值但错误的密钥同样算就绪。
TinyFish 在所有模型路由用同一把密钥，因此 `llmProvider` 从不改变答案。

`available()` 决定 web 缝能否选中本提供方；`ready()` 决定模型是否获得工具。无凭据时 `available()` 仍为 `true`（解析器存在），`ready()` 为 `false`，工具被收起而非每次失败。
