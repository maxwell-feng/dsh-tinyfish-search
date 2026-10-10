# 发行说明 — v0.15.0

[英文](RELEASE.md) | 中文

发行日期：2026-10-11

**dsh-tinyfish-search** 0.15.0 完成与 DeepSeek Harness 0.2.1-alpha.2 的对齐——即本插件所遵循的插件开发文档的最新发行版。本版本封装了原生 `icon.svg` 矢量图标、中英双语展示资源清单（`locale/en.json`、`locale/zh.json`）、自包含的 prepare 构建脚本、纯 TypeScript 架构以及遵循最新规范的 `--profile <name>` 命令行选项排布。

## 新增

- **展示元数据与专属图标**：内置原生 `icon.svg` 矢量图标与中英双语展示清单（`locale/en.json`、`locale/zh.json`），完全符合 DeepSeek Harness 0.2.1-alpha.2 插件管理器规范。在 `package.json` 中声明顶层 `icon` 字段（指向 `./icon.svg`），并规范导出 `./locale/*.json` 与 `./icon` 资源。
- **自包含构建脚本**：将 `package.json` 中的 `prepare` 脚本优化为 `tsc -p tsconfig.build.json`，确保从 Git 仓库安装时无需宿主预装全局 `pnpm` 即可自包含编译 `lib/` 产物。

## 变更

- **开发依赖对齐**：将 `@deepseek-ai/*` 开发依赖升级至 DeepSeek Harness 0.2.1-alpha.2，并已完成全量验证。
- **兼容性区间保持稳定**：peer 依赖区间继续保持 `>=0.1.7-alpha.2 <0.3.0`，全面支持 `0.1.7`、`0.2.0` 以及 `0.2.1-alpha.2` 等版本。
- **清理废弃导出项**：从 `package.json` 的 `exports` 声明中移除已被规范废弃的 `./package.json` 自导出项。
- **更新请求头标识**：将 `USER_AGENT` 标识更新为 `dsh-tinyfish-search/0.15.0`。
- **规范化命令行选项**：更新各文档中的 CLI 命令，统一将 `--profile <name>` 参数置于 `add`、`remove`、`update` 等子命令之前。

## 升级

执行 `dsh plugin --profile web add dsh-tinyfish-search@0.15.0`，或让 profile 跟踪最新发行版即可。无需任何手工步骤：配置字段、取值与默认值均未改动。本版**并非强制升级**——`0.14.0` 与 `0.13.0` 在 DeepSeek Harness 0.2.1-alpha.2 上本就可加载。

## 验证

- 类型检查与构建均干净，22 项单元测试在 DeepSeek Harness 0.2.1-alpha.2 的各包上全部通过。
- `node scripts/check-docs-language.ts` 检查全部通过，零语言混淆或链接跳转错误。
