# Uninstall Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UNINSTALL.zh.md)

## Remove the plugin bundle

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

This removes the package from the profile and drops its bundle layer from `dsh.profile.bundles`. `--profile <name>` goes before `remove`.

## Clean up custom configuration (optional)

If you added a `dsh-tinyfish-search` row in `$DSH_HOME/profiles/<profile>/cordis.patch.yml` or `$DSH_HOME/cordis.patch.yml`, delete it:

```yaml
- id: dsh-tinyfish-search
  config:
    ...
```

## Clean up the environment variable (optional)

If you no longer use TinyFish, remove the API key from your environment:

```sh
unset TINYFISH_API_KEY
```

```powershell
Remove-Item Env:\TINYFISH_API_KEY
```

## Verify

Restart the profile:

```sh
dsh web
```

- `dsh-tinyfish-search` is gone from Settings → Plugins.
- `dsh --profile web --dump-config | grep tinyfish` prints nothing.
- `web_search` falls back to `deepseek-search-api` (the 0.2.2 default), to `deepseek-official` on earlier hosts, or to no provider if none is installed.
