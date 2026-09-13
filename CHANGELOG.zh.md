# 更新日志

[English](CHANGELOG.md) | 中文

本项目的所有重要版本演进记录均归档于此。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，并严格遵循 [语义化版本规范](https://semver.org/lang/zh-CN/)。

## [0.8.2] - 2026-09-13

### 安全加固与生态同步

- **SSRF 深度防御与主机边界校验**：
  - 在 `src/provider.ts` 中实现严格的协议与主机安全校验：仅允许 `http:` 与 `https:` 协议，自动拦截指向 `localhost`、环回地址（`127.0.0.0/8`, `::1`）、RFC1918 私网网段（`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`）及保留网段的请求，防范 SSRF 风险。
- **DeepSeek Harness 0.1.5-rc.2 验证与文档全面同步**：
  - 精简 `pnpm-workspace.yaml` 中的旧版本白名单声明；
  - 请求标识头 `USER_AGENT` 升级为 `dsh-tinyfish-search/0.8.2`；
  - 全面更新双语文档体系（`INSTALL.md`, `INSTALL.zh.md`, `UPDATE.md`, `UPDATE.zh.md`, `USAGE.md`, `USAGE.zh.md`, `CONFIG.md`, `CONFIG.zh.md`, `UNINSTALL.md`, `UNINSTALL.zh.md`, `README.md`, `README.zh.md`），明确标注经 DeepSeek Harness `0.1.5-rc.2` 全面验证；
  - 自动化测试用例扩充至 21 项，全量验证通过。

---

## [0.8.1] - 2026-09-11

### 安全修复

- 全面修复 Dependabot 报告的 `js-yaml` 漏洞（升级至 `4.3.2`，彻底解决 CVE-2026-84375 等 8 项安全告警）；
- 纯 TypeScript 架构；
- 请求标识头 `USER_AGENT` 升级为 `dsh-tinyfish-search/0.8.1`；
- 全套 20 项自动化测试验证通过。

---

## [0.8.0] - 2026-09-11

- 架构现代化与 DeepSeek Harness 0.1.5-rc.2 兼容。
