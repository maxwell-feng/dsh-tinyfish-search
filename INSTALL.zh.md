# 安装指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/INSTALL.md) | 中文

> 已在 DeepSeek Harness **0.2.2-alpha.2** 上随 `dsh-tinyfish-search` **0.18.1** 完成全面验证。

本文档覆盖环境要求、全部安装方式与安装验证方法。

---

## 1. 环境要求

- DeepSeek Harness `dsh` CLI `>=0.1.7-alpha.2 <0.3.0`（任意带 web 缝的 profile，如 `web`）——已在 `0.2.2-alpha.2` 上验证
- 宿主会在准入插件行之前，用运行时版本校验本插件声明的运行时要求。自 DSH `0.2.1-alpha.4` 起，包自有的 `engines.dsh` 区间单独决定准入，`@deepseek-ai/dsh*` 的 peer 依赖在该判断中被忽略；只有缺少 `engines.dsh` 时才回退到这些 peer。两者都按 `includePrerelease` 语义匹配，因此预发行版运行时也参与比较。本插件声明 `engines.dsh: ">=0.1.7-alpha.2 <0.3.0"`，因此 `0.2.2-alpha.2`（以及 `0.2.x` 线）与整条 `0.1.7` 预发行线都通过。区间之外的宿主会在加载时被直接拒绝并点明确切的要求，只有 `dsh plugin allow-version` 才能覆盖该拒绝——见[宿主兼容性闸门](README.zh.md#宿主兼容性闸门)。
- Node.js `^22.19.0 || >=24.0.0`（与 harness 引擎区间一致）
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)（免费创建；Search 在任意钱包余额下免费）
- 源码目录 / git 安装需要 pnpm `>=10`（它经 `prepare` 脚本从源码构建 `lib/`）

---

## 2. 从 npm 仓库安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

或锁定确切版本：

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.18.1
```

> **命令行语法说明**：根据 DeepSeek Harness 0.2.1-alpha.1 规范，`--profile <name>` 必须置于 `add` 等子命令之前。

---

## 3. 从 git 安装

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git 安装拿到的是源码而非构建产物：pnpm 会运行包的 `prepare` 脚本，通过 `tsc -p tsconfig.build.json` 自动从源码编译构建 `lib/`。

在改动进入 npm 之前，用同一条命令即可取用未发布的最新提交——它始终跟踪默认分支。

---

## 4. 从 tarball 或源码目录安装

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.18.1.tgz
```

```sh
dsh plugin --profile web add ./dsh-tinyfish-search        # 源码目录
```

---

## 5. 设置 API key

首次搜索前先设置密钥（推荐——配置文件中不出现密钥）：

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

全部凭据选项（字面量 `apiKey`、自定义 `apiKeyEnv`、凭据服务）见[配置说明](CONFIG.zh.md)。

---

## 6. 验证安装

确认 bundle 层已组合：

```sh
dsh --profile web --dump-config | grep tinyfish   # 层已加载
```

然后启动会话，提问一个需要实时信息的问题（如“今天东京天气如何？”），确认模型调用了 `web_search` 且结果带 TinyFish 的链接/摘要。GUI 的「网页搜索」设置卡片在密钥配置好后显示提供方 `tinyfish` 与 `available: true`。

若缺密钥，模型侧根本不会被提供 `web_search` 工具：从 DeepSeek Harness 0.2.2 起，插件通过 `WebSearchProvider.ready()` 上报就绪状态，工具层据此收起该工具，而不是派发一个无法认证的调用。若搜索在无密钥的情况下仍然执行——即绕过该闸门的程序化调用方——会以 `WEB_PROVIDER_CREDENTIAL_MISSING` 失败并点名所配置的变量名。见[使用说明](USAGE.zh.md)错误表。
