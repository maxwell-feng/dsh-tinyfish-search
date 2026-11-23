# 卸载指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UNINSTALL.md) | 中文

当前插件版本：`0.23.0`。构建基线：DeepSeek Harness `0.2.3-alpha.2`；Node.js `^24.22.3 || >=26.13.1`。

## 移除插件包

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

这会从 profile 中移除该包，并从 `dsh.profile.bundles` 删除其 bundle 层。`--profile <name>` 必须放在 `remove` 之前。

## 清理自定义配置（可选）

如果你在 `$DSH_HOME/profiles/<profile>/cordis.patch.yml` 或 `$DSH_HOME/cordis.patch.yml` 中添加过 `dsh-tinyfish-search` 行，请删除它：

```yaml
- id: dsh-tinyfish-search
  config:
    ...
```

## 清理环境变量（可选）

如果不再使用 TinyFish，可从环境变量中移除 API key：

```sh
unset TINYFISH_API_KEY
```

```powershell
Remove-Item Env:\TINYFISH_API_KEY
```

## 验证

重启 profile：

```sh
dsh web
```

- **插件**页面中不再出现 `dsh-tinyfish-search`。
- `dsh --profile web --dump-config | grep tinyfish` 无输出。
- 自带 `tool-web` 行的预设仍会保留 `web_search`，并回退到宿主自身的选择：DSH 0.2.2-rc.5 及以后，DeepSeek 模型路由使用 `deepseek-official`（旧版 Messages 搜索），其他路由使用 `deepseek-search-api`；0.2.2-rc.2 至 rc.4 为 `deepseek-search-api`；更早宿主为 `deepseek-official`；若未安装其他提供方则为空。
- 依赖本 bundle 宿主级 `tool-web` 行的预设（如 `minimal`）将不再提供 `web_search`，直到为该预设恢复 `tool-web`。
