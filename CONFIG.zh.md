# 配置指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/CONFIG.md) | 中文

## 配置字段

插件导出用 `@deepseek-ai/schemastery` 构建的 `Config` schema。Host 读取它，为 Plugins 页上的 `dsh-tinyfish-search` 行渲染表单。所有字段均为可选，且都标记了 `.volatile()`。

| 字段 | 类型 | 默认值 | 角色 | 含义 |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | 字面量 API key。建议留空并优先用 `apiKeyEnv`，避免密钥写进配置文件。 |
| `apiKeyEnv` | `string` | `TINYFISH_API_KEY` | `credential-ref` | 承载 API key 的环境变量名。 |
| `baseURL` | `string` | `https://api.search.tinyfish.ai` | 普通 | API 端点基地址。必须使用 `http:` 或 `https:`。本机与私网 IP 会被拒绝。 |
| `location` | `string` | `undefined` | 普通 | 可选地区定位（如 `US`、`CN`），转发给 TinyFish。 |
| `language` | `string` | `undefined` | 普通 | 可选搜索语言（如 `en`、`zh`），转发给 TinyFish。 |

默认值声明在 schema 上，因此渲染出的表单与插件实际使用的值一致。

## 配置值的生效路径

DeepSeek Harness 0.1.7 用 schema 驱动的配置取代了旧的设置缝。

- 声明：`src/config.ts` 导出 `Config`，`src/index.ts` 再导出。Host 以 `entry.fiber.runtime.Config` 发现它。命名空间来自 profile 行 id `dsh-tinyfish-search`，插件不自行选择。
- 每字段一个实时引用：`apply(ctx, config)` 收到每字段一个 `Volatile<T>`。没有 `ctx.inject(['settings'])`，也没有注册调用。
- 每次搜索一个快照：提供方在每次搜索开始时读取全部五个字段的 `.get()`。单次搜索不会把保存前后的值混在一起。
- 写入：Plugins 页表单经 `ctx.configForms.get(entryId)` 写入 `ConfigForm`（`getSnapshot`、`subscribe`、`set`、`unset`、`mutate`、`dispose`）。写入带 revision 保护；被拒绝时返回 `false` 并重新加载宿主状态。
- 生效：已提交的修改对下一次搜索生效，无需重启或重新注册。

程序化构造接受已完成的 `TinyFishOptions`、快照对象，或返回 `TinyFishOptions` 的 thunk（`TinyFishProviderInput`）。只有插件自身路径传入 thunk。

## 推荐配置：环境变量

```sh
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

无需修改 YAML。插件在每次搜索时解析凭据。

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

行的 `id` 同时是配置表单的寻址键。重命名该行会同时改变表单命名空间。

## 网页界面配置

1. 从侧边栏打开 **Settings**。
2. 进入 **Plugins** 页面。
3. 打开 **`dsh-tinyfish-search`** 行即可在线修改。保存后无需重启宿主。

表单由 Host 依据 schema 渲染，插件不提供浏览器侧代码。

## 凭据解析顺序

每次搜索按以下顺序取第一个非空值：

1. 插件配置中的字面量 `apiKey`。
2. 凭据服务：`ctx.credentials.resolve(apiKeyEnv)`。
3. 启动环境：`launchEnvironmentOf(ctx).get(apiKeyEnv)`。
4. `process.env[apiKeyEnv]`，用于宿主之外的独立使用。

带解析器的提供方即使尚未存储密钥也视为 `available`。缺密钥时在搜索阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 报错，并点名所配置的变量。错误表见[使用说明](USAGE.zh.md)。

## 就绪判定（`ready()`）

DeepSeek Harness 0.2.2 为 `WebSearchProvider` 新增了可选的 `ready(llmProvider): Promise<boolean>` 成员。`dsh-tool-web` 把它当作 `web_search` 的激活条件：路由回答 `false` 的模型步不会拿到该工具。`tinyfish` 提供方按上面的凭据顺序解析，并报告是否找到密钥：

- 存在字面量 `apiKey` 时立即就绪。否则运行一次解析器。
- 解析出非空值即就绪，其余情况（包括空字符串）均不就绪。
- 凭据存储读取时抛错则回答 `false`，因为同一次读取也会让搜索失败。
- 该检查只涉及配置。它不访问 TinyFish，也不校验密钥，因此有值但错误的密钥同样算就绪。
- TinyFish 在所有模型路由上使用同一把密钥，因此 `llmProvider` 从不改变答案。

`available()` 决定缝在操作执行时能否选中本提供方。`ready()` 决定模型是否被提供该工具。没有可用凭据时，`available()` 因解析器存在仍返回 `true`，而 `ready()` 返回 `false`，于是工具被收起，而不是每次调用都失败。
