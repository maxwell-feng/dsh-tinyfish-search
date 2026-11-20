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
- A preset that mounts its own `tool-web` row keeps `web_search`, which falls back to the harness's own selection: on DSH 0.2.2-rc.5 and later, `deepseek-official` (legacy Messages search) on DeepSeek model routes and `deepseek-search-api` elsewhere; on 0.2.2-rc.2 through rc.4, `deepseek-search-api`; on earlier hosts, `deepseek-official`; or no provider if none is installed.
- A preset that relied on this bundle's host-level `tool-web` row (for example `minimal`) no longer sees `web_search` until `tool-web` is restored for that preset.
