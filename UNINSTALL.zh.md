# 卸载说明文档 (Uninstall Guide)

[English](UNINSTALL.md) | 简体中文

本文档指导如何从 DeepSeek Harness 的指定 Profile 中完整卸载 **dsh-tinyfish-search** 插件及其相关配置与密钥引用。

---

## 1. 移除插件包 (Bundle)

执行以下命令从目标 profile（例如 `web`）中移除该插件依赖与组合包补丁层：

```bash
dsh plugin --profile web remove dsh-tinyfish-search
```

这会自动从 profile 的 `package.json` 依赖项中卸载该包，并从 `dsh.profile.bundles` 列表中注销其 patch 层。

---

## 2. 清理用户级自定义配置 (可选)

如果你曾在 profile 的 `cordis.patch.yml`（位于 `$DSH_HOME/profiles/<profile>/cordis.patch.yml`）或全局 `$DSH_HOME/cordis.patch.yml` 中配置过该插件的覆盖项，请手动删除对应的 YAML 条目：

```yaml
# 删除此条目及子键
- id: dsh-tinyfish-search
  config:
    ...
```

---

## 3. 清理环境变量凭据 (可选)

如果你不再需要使用 TinyFish Search API，可以从系统环境中注销对应的 API Key 环境变量：

```bash
# Linux / macOS / Android Termux
unset TINYFISH_API_KEY

# Windows PowerShell (从当前会话注销)
Remove-Item Env:\TINYFISH_API_KEY
```

---

## 4. 验证卸载状态

重启 DeepSeek Harness：

```bash
dsh web
```

- 检查 Web 界面的 Settings -> Plugins 列表中不再显示 `dsh-tinyfish-search`。
- 原生 `web_search` 工具将自动回退为默认的搜索后端（如 `deepseek-official` 或其它已安装的 search provider）。
