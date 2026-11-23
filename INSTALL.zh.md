# 安装指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/INSTALL.md) | 中文

## 环境要求

- 带 web 缝的 DeepSeek Harness `dsh`，例如 `web` profile。构建基线：`0.2.3-alpha.2`（2026-11-22 发布）。`engines.dsh`：`>=0.1.7-alpha.2 <0.3.0`。
- Node.js `^24.22.3 || >=26.13.1`。DSH 0.2.3 要求 Node.js 24.22.3 或更高的 24.x 版本，或 Node.js 26.13.1 或更高版本。
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)。Search 在任意钱包余额下免费。
- 从 git 或源码目录安装需要 pnpm `>=10`，它们会通过 `prepare` 脚本构建 `lib/`。

DSH 在加载插件行之前校验 `engines.dsh`。区间之外的宿主会被拒绝，并打印确切的要求。`dsh plugin --profile <name> allow-version` 可为该插件与 DSH 版本的这个确切组合授予豁免；见 [兼容性说明](README.zh.md#环境要求)。

## 从 npm 安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
dsh plugin --profile web add dsh-tinyfish-search@0.23.0   # 锁定确切版本
```

`--profile <name>` 必须放在 `add`、`remove`、`update`、`allow-version` 之前。

## 从 git 安装

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

Git 安装会拉取源码。pnpm 会运行 `prepare`，用 `tsc -p tsconfig.build.json` 编译 `lib/`。该命令跟踪默认分支，也能取到尚未发布的改动。

## 从 tarball 或源码目录安装

先在源码目录运行 `npm pack`，它会构建 `lib/` 并生成下面这个 `.tgz`。

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
dsh plugin --profile web add ./dsh-tinyfish-search        # 源码目录
```

## 设置 API key

首次搜索前设置密钥。环境变量可避免把密钥写进配置文件。

```sh
export TINYFISH_API_KEY="your_api_key_here"                      # 仅当前 shell
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.bashrc  # 永久生效（bash）
echo 'export TINYFISH_API_KEY="your_api_key_here"' >> ~/.zshrc   # 永久生效（zsh）
source ~/.bashrc                                                 # 或重开终端
```

```powershell
setx TINYFISH_API_KEY "your_api_key_here"    # 永久生效——新开的终端
$env:TINYFISH_API_KEY = "your_api_key_here"  # 仅当前会话
```

字面量 `apiKey`、自定义 `apiKeyEnv` 与凭据服务见[配置说明](CONFIG.zh.md)。

## 验证

确认 bundle 层已组合：

```sh
dsh --profile web --dump-config | grep tinyfish   # 层已加载
```

打开 **插件 → 内置插件配置 → 网页搜索与获取**，确认 **网页搜索提供方** 下拉框列出 **TinyFish Search**（id `tinyfish`）。然后启动会话，提问一个需要实时信息的问题，例如“今天东京天气如何？”。模型应调用 `web_search`，结果应带 TinyFish 的链接与摘要。

若缺密钥，模型侧不会被提供 `web_search`：`WebSearchProvider.ready()` 报告没有可用凭据，工具层据此收起该工具。绕过该闸门的已派发搜索会以 `WEB_PROVIDER_CREDENTIAL_MISSING` 失败，并点名所配置的变量。见[使用说明](USAGE.zh.md)错误表。
