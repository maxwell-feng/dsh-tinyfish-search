# Update Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UPDATE.zh.md)

Current release: 0.23.0. Build baseline: DeepSeek Harness `0.2.3-alpha.2`.

## Before you upgrade

- Check the host version and Node version. DSH 0.2.3 requires Node.js 24.22.3 or newer in the 24.x line, or Node.js 26.13.1 or newer.
- Keep a copy of your profile `cordis.patch.yml` if you have custom row overrides.
- 0.23.0 moves the dependencies to `0.2.3-alpha.2`, aligns cordis and schemastery with the 0.2.3 line, raises the Node.js floor to match DSH, and refreshes the documentation. The API and configuration fields are unchanged; normal search behavior is unchanged, and malformed responses no longer throw from `mapTinyFishResponse`. The bundle patch still pins `searchProvider: tinyfish`, so DSH's route-based search selection does not change this plugin's results. A 0.2.2 host on Node.js 24.9 can stay on 0.22.0; install 0.23.0 after moving to DSH 0.2.3-alpha.2 or to a host that meets the new Node floor.

## Upgrade commands

From npm:

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
dsh plugin --profile web add dsh-tinyfish-search@0.23.0   # exact version
```

From git:

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

From a tarball:

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.23.0.tgz
```

`--profile <name>` goes before `add`, `remove`, `update` and `allow-version`.

## After you upgrade

Restart the profile and run one search to confirm `web_search` still returns TinyFish results. No configuration changes are needed. For details about this release, see [CHANGELOG.md](CHANGELOG.md).

## Rollback

Install the previous version again:

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.22.0
```

Rollback does not change your configuration. Restart the profile after the command.

## If the plugin does not load

Check `dsh --profile web --dump-config | grep tinyfish` first. A row outside the declared `engines.dsh` range is refused at load with the exact requirement named. `dsh plugin --profile <name> allow-version` can grant an exemption for that pair; see the [compatibility section](README.md#requirements).
