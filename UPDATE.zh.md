# 更新指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UPDATE.md) | 中文

当前版本：0.21.0。构建基线：DeepSeek Harness `0.2.2-rc.3`。

## 升级前

- 检查宿主版本与 Node 版本。DSH 0.2.2 宿主要求 Node 24.9 或更高。
- 如果你自定义过行覆盖，请备份 profile 的 `cordis.patch.yml`。
- 0.21.0 只更新依赖。API、配置字段与搜索行为均未改变。它在 `0.2.2-rc.2` 及更早的 `0.2.x` 宿主上也能运行，因此本次升级是可选的。

## 升级命令

从 npm：

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
dsh plugin --profile web add dsh-tinyfish-search@0.21.0   # 确切版本
```

从 git：

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

从 tarball：

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.21.0.tgz
```

`--profile <name>` 必须放在 `add`、`remove`、`update` 之前。

## 升级后

重启 profile，运行一次搜索，确认 `web_search` 仍返回 TinyFish 结果。无需修改配置。本次发布的详情见 [CHANGELOG.zh.md](CHANGELOG.zh.md)。

## 回滚

重新安装上一版本：

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.20.0
```

回滚不会改动配置。命令执行后重启 profile。

## 插件无法加载时

先检查 `dsh --profile web --dump-config | grep tinyfish`。声明区间之外的插件行会在加载时被拒绝，并打印确切的要求。`dsh plugin allow-version` 可为该版本对授予豁免；见 [兼容性说明](README.zh.md#环境要求)。
