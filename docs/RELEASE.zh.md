# 发行说明 — v0.15.0

[英文](RELEASE.md) | 中文

发行日期：2026-10-11

**dsh-tinyfish-search** 0.15.0 完成与 DeepSeek Harness 0.2.1-alpha.2 的对齐——即本插件所遵循的插件开发文档的最新发行版。本版本封装了原生 `icon.svg` 矢量图标、中英双语展示资源清单（`locale/en.json`、`locale/zh.json`）、自包含的 prepare 构建脚本、纯 TypeScript 架构以及遵循最新规范的 `--profile <name>` 命令行选项排布。

## 新增

- **展示元数据与专属图标**：内置原生 `icon.svg` 矢量图标与中英双语展示资源（`locale/en.json`、`locale/zh.json`），符合 DSH 0.2.1-alpha.2 插件管理器展示规范。在 `package.json` 中配置顶层 `"icon": "./icon.svg"` 以及导出 `"./locale/*.json"` 与 `"./icon"`。
- **自包含 prepare 构建脚本**：在 `package.json` 中将 `prepare` 脚本优化为 `tsc -p tsconfig.build.json`，确保从 Git 仓库安装时无需宿主预装全局 `pnpm` 即可自包含编译 `lib/` 产物。

## 变更

- **宿主对齐**：开发依赖升级至 DeepSeek Harness 0.2.1-alpha.2，并已针对该版本完成全量验证。
- **peer 区间保持 `>=0.1.7-alpha.2 <0.3.0`**：DeepSeek Harness 0.2.1-alpha.2 会在接纳插件行之前校验 peer 区间，整条 `0.1.7` 线与 `0.2.x` 线（含 `0.2.1-alpha.2`）均可通过准入。
- **废弃导出清理**：从 `package.json` 的 `exports` 中移除了已过时的 `"./package.json": "./package.json"` 声明。
- **请求头标识更新**：`USER_AGENT` 标识头更新为 `dsh-tinyfish-search/0.15.0`。
- **命令行选项位置规范**：全量更新中英双语指南中的命令，将 `--profile <name>` 参数前置于 `add`、`remove`、`update` 等子命令之前。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.15.0`，或让 profile 跟踪最新发行版即可。无需任何手工步骤：配置字段、取值与默认值均未改动。本版**并非强制升级**——`0.14.0` 与 `0.13.0` 在 DeepSeek Harness 0.2.1-alpha.2 上本就可加载。

## 验证

- 类型检查与构建均干净，22 项单元测试在 DeepSeek Harness 0.2.1-alpha.2 的各包上全部通过。
- `node scripts/check-docs-language.ts` 检查全部通过，零语言混淆或链接跳转错误。
