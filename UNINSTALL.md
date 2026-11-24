# Uninstall Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UNINSTALL.zh.md)

Current plugin version: `0.23.0`. Build baseline: DeepSeek Harness `0.2.3-alpha.2`; Node.js `^24.22.3 || >=26.13.1`.

## Remove the plugin bundle

```sh
dsh plugin --profile web remove dsh-tinyfish-search
```

This removes the package and its bundle layer from `dsh.profile.bundles`; `--profile <name>` goes before `remove`.

## Clean up custom configuration (optional)

If you added a `dsh-tinyfish-search` row in `$DSH_HOME/profiles/<profile>/cordis.patch.yml` or `$DSH_HOME/cordis.patch.yml`, delete it:

```yaml
- id: dsh-tinyfish-search
  config:
    ...
```

## Clean up the environment variable (optional)

To stop using TinyFish, remove the key from your environment:

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

- `dsh-tinyfish-search` is gone from the **Plugins** page.
- `dsh --profile web --dump-config | grep tinyfish` prints nothing.
- A preset with its own `tool-web` row keeps `web_search`, falling back to the harness's selection: `deepseek-official` (legacy Messages search) on DeepSeek routes and `deepseek-search-api` elsewhere since 0.2.2-rc.5; `deepseek-search-api` on 0.2.2-rc.2–rc.4; `deepseek-official` earlier; none if no provider is installed.
- A preset relying on this bundle's host-level `tool-web` row (e.g. `minimal`) loses `web_search` until `tool-web` is restored.
