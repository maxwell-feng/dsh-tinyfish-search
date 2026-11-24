# 安装指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/INSTALL.md) | 中文

## 环境要求

- 带 web 缝的 DeepSeek Harness `dsh`（如 `web` profile）。构建基线：`0.2.3-alpha.2`（2026-11-22）。`engines.dsh`：`>=0.1.7-alpha.2 <0.3.0`。
- Node.js `^24.22.3 || >=26.13.1`；DSH 0.2.3 要求 24.x 线 24.22.3+，或 26.13.1+。
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)。Search 在任意钱包余额下免费。
- 从 git 或源码目录安装需 pnpm `>=10`，通过 `prepare` 构建 `lib/`。

DSH 在加载插件行前校验 `engines.dsh`；区间外宿主会被拒绝，并打印确切要求。`dsh plugin --profile <name> allow-version` 可为该组合豁免；见[兼容性说明](README.zh.md#环境要求)。

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

Git 安装拉取源码；pnpm 运行 `prepare`（`tsc -p tsconfig.build.json`）编译 `lib/`。命令跟踪默认分支，也能取到未发布改动。

## 从 tarball 或源码目录安装

先在源码目录运行 `npm pack`，它会构建 `lib/` 并生成下面的 `.tgz`。

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
dsh plugin --profile web add ./dsh-tinyfish-search        # 源码目录
```

## 设置 API key

首次搜索前设置密钥；环境变量可避免密钥写进配置文件。

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

打开 **插件 → 内置插件配置 → 网页搜索与获取**，确认 **网页搜索提供方** 下拉框列出 **TinyFish Search**（id `tinyfish`）。提问实时问题（如“今天东京天气如何？”）；模型应调用 `web_search` 并返回链接与摘要。

缺密钥时，`WebSearchProvider.ready()` 报告无可用凭据，工具层不提供 `web_search`；绕过闸门的已派发搜索以 `WEB_PROVIDER_CREDENTIAL_MISSING` 失败，并点名所配置的变量。错误表见[使用说明](USAGE.zh.md)。
