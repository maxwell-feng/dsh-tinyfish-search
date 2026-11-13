# Update Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UPDATE.zh.md)

Current release: 0.21.0. Build baseline: DeepSeek Harness `0.2.2-rc.3`.

## Before you upgrade

- Check the host version and Node version. DSH 0.2.2 hosts require Node 24.9 or newer.
- Keep a copy of your profile `cordis.patch.yml` if you have custom row overrides.
- 0.21.0 is a dependency-only release. The API, configuration fields and search behavior are unchanged. It runs on `0.2.2-rc.2` and earlier `0.2.x` hosts as well, so this upgrade is optional.

## Upgrade commands

From npm:

```sh
dsh plugin --profile web add dsh-tinyfish-search@latest
dsh plugin --profile web add dsh-tinyfish-search@0.21.0   # exact version
```

From git:

```sh
dsh plugin --profile web add github:maxwell-feng/dsh-tinyfish-search
```

From a tarball:

```sh
dsh plugin --profile web add ./dsh-tinyfish-search-0.21.0.tgz
```

`--profile <name>` goes before `add`, `remove` and `update`.

## After you upgrade

Restart the profile and run one search to confirm `web_search` still returns TinyFish results. No configuration changes are needed. For details about this release, see [CHANGELOG.md](CHANGELOG.md).

## Rollback

Install the previous version again:

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.20.0
```

Rollback does not change your configuration. Restart the profile after the command.

## If the plugin does not load

Check `dsh --profile web --dump-config | grep tinyfish` first. A row outside the declared `engines.dsh` range is refused at load with the exact requirement named. `dsh plugin allow-version` can grant an exemption for that pair; see the [compatibility section](README.md#requirements).
