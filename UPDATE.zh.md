# 更新说明文档 (Update Guide)

[英文](UPDATE.md) | 简体中文

> 本版本已在 DeepSeek Harness **0.1.7-rc.1** 上随 `dsh-tinyfish-search` **0.11.1** 完成全面验证。

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
dsh plugin --profile web add dsh-tinyfish-search@0.11.1
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
dsh plugin --profile web add ./dsh-tinyfish-search-0.11.1.tgz
```

---

## 2. 从 0.11.0 升级至 0.11.1 注意事项

0.11.1 不改动运行时逻辑、不改配置、不改工具接口：行为与 0.11.0 完全一致，属于文档与工程化修补版本。

- **仓库只保留 TypeScript 源码。** 双语文档闸门由 `scripts/check-docs-language.mjs` 迁至 `scripts/check-docs-language.ts`。Node ≥22.19 会剥离类型，因此该闸门依旧无需安装任何依赖即可运行，CI 中也仍在安装依赖之前执行。`tsconfig.json` 现把 `scripts/**/*.ts` 纳入 include，`pnpm run typecheck` 会一并检查该闸门。
- **文档修正。** README 的升级章节顺序错乱且有一条重复；两份更新日志的链接定义缺失或顺序不对；中文更新日志存在重复分隔线 —— 均已修正。

除更新包之外无需任何操作。

---

## 3. 从 0.10.0 / 0.9.x 升级至 0.11.0 注意事项

0.11.0 把宿主基线抬升到 DeepSeek Harness `0.1.7-alpha.2`，并已在 `0.1.7-rc.1` 上完成验证。`@deepseek-ai/dsh-*` peer 区间更新为 `^0.1.7-alpha.2`（即引入易变配置的那条发布线），开发依赖锁定至 `0.1.7-rc.1`，`engines.dsh` 更新为 `^0.1.7-alpha.2`。

DeepSeek Harness 0.1.7 以 schema 驱动的易变配置取代了旧的设置缝，因此 `apply` 不再调用 `ctx.settings.installSection`：Host 直接读取本插件导出的 `Config` schema，并以 profile 行 id 为键为该条目渲染配置表单。`TINYFISH_SETTINGS_NAMESPACE` 随之移除，`@deepseek-ai/dsh-settings` 也不再是消费的 peer 依赖。

**在 `0.1.6` 宿主上，插件会在加载阶段被拒绝。** DeepSeek Harness 0.1.7-rc.1 会在加载插件行之前，用运行时版本校验插件声明的 `@deepseek-ai/dsh*` peer 依赖。请先升级宿主，或按 DSH 打印的提示授予确切版本豁免（`dsh plugin allow-version dsh-tinyfish-search@0.11.0 <你的 dsh 版本>`）。

配置项保持 100% 向后兼容：字段名、取值与默认值完全一致。SSRF 纵深防御机制持续生效。

---

## 4. 从 0.9.0 升级至 0.10.0 注意事项

0.10.0 完成与 DeepSeek Harness `0.1.6-alpha.2` 的对齐：`@deepseek-ai/dsh-*` peer 区间更新为 `^0.1.6-alpha.2`，开发依赖锁定至 `0.1.6-alpha.2`，`engines.dsh` 更新为 `^0.1.6-alpha.2`。本插件当时消费的全部扩展缝（`ctx.web`、`ctx.settings.installSection`、`ctx.credentials.resolve` 与 `launchEnvironmentOf`）在 `0.1.6-alpha.2` 下源码级兼容，SSRF 纵深防御机制完备运作。配置完全平滑兼容，原地升级无需任何手动修改。

---

## 5. 从 0.8.3 / 0.8.x 升级至 0.9.0 注意事项

0.9.0 完成与 DeepSeek Harness `0.1.6-alpha.1` 的对齐：`@deepseek-ai/dsh-*` peer 区间改为 `^0.1.6-alpha.1`——旧的 `^0.1.5-rc.2` 按 SemVer 预发布规则并不满足 `0.1.6` 的预发布版本；`engines.dsh` 与 `engines.node` 跟随宿主（`^22.19.0 || >=24.0.0`）。本插件消费的全部缝（`ctx.web`、`ctx.settings.installSection`、`ctx.credentials`、`launchEnvironmentOf`）在两个 harness 版本之间源码完全一致，因此无需改动源码。发布包现仅包含 `lib/`、`cordis.patch.yml` 与 `LICENSE`：各文档保留在仓库中，不再随包安装进你的 profile。配置项完全兼容，pnpm 会原地刷新，无需任何手工调整。

---

## 6. 升级后验证

完成安装后，重启或直接启动该 profile：

```bash
dsh web
```

在会话中发起包含实时检索的提问（例如：“今天北京天气如何？”），检查工具结果是否由 TinyFish 返回且模型能给出最新数据。

---

## 7. 版本回滚方案

若新版本与你的本地环境存在偶发冲突，可随时回退到上一稳定版本：

```bash
dsh plugin --profile web add dsh-tinyfish-search@0.4.0
```
