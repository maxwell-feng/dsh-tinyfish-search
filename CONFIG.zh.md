# 配置说明文档 (Configuration Guide)

[English](CONFIG.md) | 简体中文

本文档详细说明 `dsh-tinyfish-search` 插件在 DeepSeek Harness 中的所有配置项、校验规则、环境变量覆盖及加载层配置方法。

---

## 1. 配置字段说明

插件导出的 `Config` 使用 `@deepseek-ai/schemastery` 进行运行时严格类型校验。所有配置字段均为可选项（拥有合理的默认值或环境变量回退）。

| 配置字段 | 类型 | 默认值 | 敏感级别 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `undefined` | `secret` | 明文 TinyFish API Key。**推荐留空**，优先使用 `apiKeyEnv`，避免密钥写入明文配置文件。 |
| `apiKeyEnv` | `string` | `"TINYFISH_API_KEY"` | `credential-ref` | 存放 TinyFish API Key 的环境变量名称。优先从该环境变量中读取。 |
| `baseURL` | `string` | `"https://api.search.tinyfish.ai"` | 普通 | TinyFish Search API 的根请求地址。 |
| `location` | `string` | `undefined` | 普通 | 可选的地理定位参数（例如 `"US"`, `"CN"`），将透传给 TinyFish 搜索接口进行定向检索。 |
| `language` | `string` | `undefined` | 普通 | 可选的搜索语言参数（例如 `"en"`, `"zh"`），将透传给 TinyFish 搜索接口。 |

---

## 2. 推荐配置方式（环境变量）

在运行 `dsh` 的系统环境中设置环境变量：

```bash
# Linux / macOS / Android Termux
export TINYFISH_API_KEY="sk-tinyfish-your-api-key"

# Windows PowerShell
$env:TINYFISH_API_KEY = "sk-tinyfish-your-api-key"
```

只要配置了该环境变量，无需修改任何 YAML 文件，插件在加载时会自动读取并注入凭据。

---

## 3. 在 Profile 中进行静态配置 (`cordis.patch.yml`)

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

---

## 4. 运行时 Web 界面配置

在 DeepSeek Harness Web 界面中：
1. 打开左侧菜单中的 **Settings（设置）**。
2. 进入 **Plugins（插件设置）** 页面。
3. 找到 **`dsh-tinyfish-search`** 卡片，即可直接通过可视化表单修改 API Key、Base URL 与地区语言参数，修改立即生效，无需重启进程。
