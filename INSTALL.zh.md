# 安装说明文档 (Install Guide)

[English](INSTALL.md) | 简体中文

> 已在 DeepSeek Harness **0.1.5-rc.2** 上随 `dsh-tinyfish-search` **0.6.1** 完成全面验证。

本文档覆盖环境要求、全部安装方式与安装验证方法。

---

## 1. 环境要求

- DeepSeek Harness `dsh` CLI `0.1.5-rc.2` 或更新（任意带 web 缝的 profile，如 `web`）
- Node.js `>=22`（与 harness 引擎区间 `^22.19.0 || >=24.0.0` 一致）
- 一个 [TinyFish API key](https://agent.tinyfish.ai/api-keys)（免费创建；Search 在任意钱包余额下免费）
- 源码目录 / git 安装需要 pnpm `>=10`（它经 `prepare` 脚本从源码构建 `lib/`）

---

## 2. 从 npm 仓库安装

```sh
dsh plugin --profile web add dsh-tinyfish-search
```

或锁定确切版本：

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.6.1
```

---

## 3. 从 git 安装

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

> Git 安装拿到的是源码而非构建产物：pnpm 会运行包的 `prepare` 脚本从源码构建 `lib/`。pnpm ≥ 10 需要一次性允许构建（它会打印确切的 `pnpm-workspace.yaml` 片段）。

在改动进入 npm 之前，用同一条命令即可取用未发布的最新提交——它始终跟踪默认分支。

---

## 4. 从 tarball 或源码目录安装

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.6.1.tgz
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

若缺密钥，首次搜索会以 `WEB_PROVIDER_CREDENTIAL_MISSING` 失败并点名所配置的变量名——见[使用说明](USAGE.zh.md)错误表。
