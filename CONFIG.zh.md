# 配置说明文档 (Configuration Guide)

[英文](CONFIG.md) | 简体中文

> 已在 DeepSeek Harness **0.1.7-rc.1** 上随 `dsh-tinyfish-search` **0.11.0** 完成全面验证。

本文档详细说明 `dsh-tinyfish-search` 插件在 DeepSeek Harness 中的所有配置项、校验规则、配置值生效路径、SSRF 安全防御、环境变量覆盖及加载层配置方法。

---

## 1. 配置字段说明

插件导出的 `Config` 是一个用 `@deepseek-ai/schemastery` 构建的 schema；Host 从插件入口模块读取它，并据此渲染该条目的配置表单。每个字段都标记了 `.volatile()`，因此校验后的配置携带的是每字段一个实时引用，而不是冻结的值。所有字段均为可选项。

| 配置字段 | 类型 | 默认值 | 敏感级别 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | 明文 TinyFish API Key。**推荐留空**，优先使用 `apiKeyEnv`，避免密钥写入明文配置文件。 |
| `apiKeyEnv` | `string` | `"TINYFISH_API_KEY"` | `credential-ref` | 存放 TinyFish API Key 的环境变量名称。 |
| `baseURL` | `string` | `"https://api.search.tinyfish.ai"` | 普通 | TinyFish Search API 的根请求地址。必须使用 `http:` 或 `https:`，直连 `localhost` 或私网 IP 会被 SSRF 安全策略拒绝。 |
| `location` | `string` | `undefined` | 普通 | 可选的地理定位参数（例如 `"US"`, `"CN"`），将透传给 TinyFish 搜索接口进行定向检索。 |
| `language` | `string` | `undefined` | 普通 | 可选的搜索语言参数（例如 `"en"`, `"zh"`），将透传给 TinyFish 搜索接口。 |

默认值声明在 schema 上，而不只写在取值处：渲染出的表单展示的就是 schema 携带的内容，因此本插件依赖的每个默认值都在这里声明。

---

## 2. 配置值的生效路径（DSH 0.1.7 配置模型）

DeepSeek Harness 0.1.7 用 schema 驱动的配置取代了旧设置缝的两半——宿主侧的 `ctx.settings.installSection` 注册与客户端侧的 `SettingsScope`。对本插件而言，这意味着：

- **声明**：`src/config.ts` 导出 `Config`，`src/index.ts` 再将其导出。Host 以 `entry.fiber.runtime.Config` 发现它；命名空间由 profile 行的 id 推导（`cordis.patch.yml` 中的 `dsh-tinyfish-search`），不由插件自行选择。
- **每字段一个实时引用**：由于每个字段都标记了 `.volatile()`，`apply(ctx, config)` 收到的是每字段一个 `Volatile<T>`。插件既没有 `ctx.inject(['settings'])`，也不做任何注册调用。
- **每次操作一个快照**：提供方注册时传入的是一个 thunk，它在每次搜索开始时读取全部五个字段的 `.get()`。因此单次搜索不会把保存前读到的 `baseURL` 与保存后读到的 `apiKeyEnv` 混在一起，提供方注册本身也永远不需要被替换。
- **写入**：Plugins 页面的配置表单经 `ctx.configForms.get(entryId)` 拿到 `ConfigForm`（`getSnapshot` / `subscribe` / `set` / `unset` / `mutate` / `dispose`）后写入。写入是 revision-fenced 的；被 Host 拒绝时解析为 `false` 并重新加载宿主状态，而不是猜测。
- **生效**：已提交的修改对下一次搜索立即生效，既不需要重启，也不需要重新注册。

程序化构造接受三种入参形态（`TinyFishProviderInput`）：已完成的 `TinyFishOptions`、仍需套用默认值的快照对象、或返回 `TinyFishOptions` 的 thunk。只有插件自身的路径传入 thunk，这正是每次搜索都能取到新快照的原因。

---

## 3. 推荐配置方式（环境变量）

在运行 `dsh` 的系统环境中设置环境变量：

```bash
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

只要配置了该环境变量，就无需修改任何 YAML 文件；插件在每次搜索时解析凭据。

---

## 4. 在 Profile 中进行静态配置 (`cordis.patch.yml`)

如果你需要自定义 API 基础路径或指定搜索区域，可以在你的 Profile 配置文件（`$DSH_HOME/profiles/<profile>/cordis.patch.yml`）中添加覆盖项：

```yaml
- id: dsh-tinyfish-search
  config:
    # apiKey: "sk-tinyfish-xxx"                # 如需直接指定密钥（不推荐明文）
    apiKeyEnv: TINYFISH_API_KEY               # 环境变量名称
    baseURL: https://api.search.tinyfish.ai   # 默认 API 端点
    location: CN                              # 定向为中国地区结果
    language: zh                              # 优先返回中文结果
```

该行的 id 同时就是配置表单的寻址键，因此重命名该行的 profile 也会同时改变表单的命名空间。

---

## 5. 运行时 Web 界面配置

在 DeepSeek Harness Web 界面中：
1. 打开左侧菜单中的 **Settings（设置）**。
2. 进入 **Plugins（插件设置）** 页面。
3. 打开 **`dsh-tinyfish-search`** 行对应的配置表单，即可直接修改 API Key、Base URL 与地区语言参数，修改立即生效，无需重启进程。

该表单是 Host 依据 schema 为该条目渲染的表单；本插件不提供浏览器半侧。

---

## 6. 凭据解析顺序

每次搜索按以下顺序取第一个非空值作为 API key（已对照 `src/options.ts` 实测验证）：

1. 插件配置中的字面量 `apiKey`。
2. 凭据服务：`ctx.credentials.resolve(apiKeyEnv)`。
3. 启动环境：`launchEnvironmentOf(ctx).get(apiKeyEnv)`。
4. `process.env[apiKeyEnv]`（覆盖宿主之外的独立使用场景）。

只要存在解析器，提供方即视为 `available`，即使密钥尚未存储——缺密钥时在搜索阶段以 `WEB_PROVIDER_CREDENTIAL_MISSING` 明确报错并点名所配置的变量。示例与完整错误表见[使用说明](USAGE.zh.md)。
