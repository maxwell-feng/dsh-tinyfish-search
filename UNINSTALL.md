# Uninstall Guide

English | [简体中文](UNINSTALL.zh.md)

This document explains how to completely uninstall `dsh-tinyfish-search` from a DeepSeek Harness profile and remove lingering configurations.

---

## 1. Remove the Plugin Bundle

Run the following command to remove the package and its active patch layer from your target profile (e.g. `web`):

```bash
dsh plugin --profile web remove dsh-tinyfish-search
```

This removes the dependency from the profile's `package.json` and purges the bundle layer from `dsh.profile.bundles`.

---

## 2. Clean Up Custom Configurations (Optional)

If you customized settings in `$DSH_HOME/profiles/<profile>/cordis.patch.yml` or the global `$DSH_HOME/cordis.patch.yml`, remove the corresponding row:

```yaml
# Remove this block
- id: dsh-tinyfish-search
  config:
    ...
```

---

## 3. Clean Up Environment Variables (Optional)

If you no longer use TinyFish, remove the API key variable:

```bash
# Linux / macOS / Android Termux
unset TINYFISH_API_KEY

# Windows PowerShell
Remove-Item Env:\TINYFISH_API_KEY
```

---

## 4. Verification

Restart the profile:

```bash
dsh web
```

- Confirm `dsh-tinyfish-search` no longer appears in Settings -> Plugins.
- Confirm the bundle layer is gone:

```sh
dsh --profile web --dump-config | grep tinyfish   # no output expected
```

- `web_search` automatically falls back to default providers (e.g. `deepseek-official`).
