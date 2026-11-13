# 卸载指南

[英文](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UNINSTALL.md) | 中文

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

- Settings → Plugins 中不再出现 `dsh-tinyfish-search`。
- `dsh --profile web --dump-config | grep tinyfish` 无输出。
- `web_search` 回退到 `deepseek-search-api`（0.2.2 默认值），更早宿主回退到 `deepseek-official`，若未安装其他提供方则为空。
