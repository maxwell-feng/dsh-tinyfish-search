# 更新指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UPDATE.md) | 中文

当前版本：0.23.0。构建基线：DeepSeek Harness `0.2.3-alpha.2`。

## 升级前

- 检查宿主与 Node 版本：DSH 0.2.3 要求 24.x 线 24.22.3+，或 26.13.1+。
- 如果你自定义过行覆盖，请备份 profile 的 `cordis.patch.yml`。
- 0.23.0 将依赖更新到 `0.2.3-alpha.2`，使 cordis 与 schemastery 对齐该线，将 Node.js 门槛提高到与 DSH 一致，并刷新文档。API 与配置字段未变；正常搜索行为不变，畸形响应不再由 `mapTinyFishResponse` 抛出。bundle 补丁仍固定 `searchProvider: tinyfish`，因此 DSH 按路由选择不会改变结果。使用 Node.js 24.9 的 0.2.2 宿主可继续使用 0.22.0；升级到 DSH 0.2.3-alpha.2 或满足新 Node 门槛后再安装 0.23.0。

## 升级命令

从 npm：

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
dsh plugin --profile web add dsh-tinyfish-search@0.23.0   # 确切版本
```

从 git：

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

从 tarball：

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
```

`--profile <name>` 必须放在 `add`、`remove`、`update`、`allow-version` 之前。

## 升级后

重启 profile 并运行一次搜索，确认 `web_search` 仍返回 TinyFish 结果。无需修改配置。详情见 [CHANGELOG.zh.md](CHANGELOG.zh.md)。

## 回滚

重新安装上一版本：

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.22.0
```

回滚不会改动配置；命令后重启 profile。

## 插件无法加载时

先检查 `dsh --profile web --dump-config | grep tinyfish`。`engines.dsh` 区间外的行会在加载时被拒绝，并打印确切要求；`allow-version` 可为该组合豁免。见[兼容性说明](README.zh.md#环境要求)。
