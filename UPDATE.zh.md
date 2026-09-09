# 更新说明文档 (Update Guide)

[English](UPDATE.md) | 简体中文

> 本版本已在 DeepSeek Harness **0.1.5-alpha.1** 最新发布版本上完成全面验证。

本文档介绍如何将 **dsh-tinyfish-search** 插件安全升级至最新版本，以及配置兼容与回滚操作。

---

## 1. 快速升级步骤

### 从 npm 升级
如果你最初是通过 npm 安装的该插件，可以直接执行：

```bash
dsh plugin --profile web update dsh-tinyfish-search@latest
```

或指定确切目标版本：

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.4.0
```

### 从 Git 仓库升级
如果你是通过 GitHub 仓库直接安装的，可拉取最新提交并重新构建：

```bash
cd /path/to/dsh-tinyfish-search
git pull origin master
pnpm install
pnpm run build
```

或在指定 profile 中重新添加最新提交：

```bash
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

### 从 Tarball 离线包升级

```bash
dsh plugin --profile web add ./dsh-tinyfish-search-0.4.0.tgz
```

---

## 2. 升级后验证

完成安装后，重启或直接启动该 profile：

```bash
dsh web
```

在会话中发起包含实时检索的提问（例如：“今天北京天气如何？”），检查终端输出是否包含 `[dsh-tinyfish-search]` 正常发起 GET 请求日志，确认工具结果返回且模型能给出最新数据。

---

## 3. 版本回滚方案

若新版本与你的本地环境存在偶发冲突，可随时回退到上一稳定版本：

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.3.0
```
