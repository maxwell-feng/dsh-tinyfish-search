# Update Guide

English | [Chinese](https://github.com/maxwell-feng/dsh-tinyfish-search/blob/main/UPDATE.zh.md)

Current release: 0.23.0. Build baseline: DeepSeek Harness `0.2.3-alpha.2`.

## Before you upgrade

- Check the host and Node versions: DSH 0.2.3 requires Node.js 24.22.3+ on the 24.x line, or 26.13.1+.
- Keep a copy of your profile `cordis.patch.yml` if you have custom row overrides.
- 0.23.0 moves dependencies to `0.2.3-alpha.2`, aligns cordis and schemastery with that line, raises the Node.js floor to match DSH, and refreshes docs. API and configuration fields are unchanged; normal search behavior is unchanged, and malformed responses no longer throw from `mapTinyFishResponse`. The bundle patch still pins `searchProvider: tinyfish`, so DSH's route-based selection does not change results. A 0.2.2 host on Node.js 24.9 can stay on 0.22.0; install 0.23.0 after moving to DSH 0.2.3-alpha.2 or a host meeting the new Node floor.

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

Restart the profile and run one search to confirm `web_search` still returns TinyFish results. No configuration changes are needed. See [CHANGELOG.md](CHANGELOG.md) for details.

## Rollback

Install the previous version again:

```sh
dsh plugin --profile web add dsh-tinyfish-search@0.22.0
```

Rollback leaves configuration unchanged; restart the profile afterward.

## If the plugin does not load

Check `dsh --profile web --dump-config | grep tinyfish` first. A row outside `engines.dsh` is refused at load with the exact requirement; `allow-version` can exempt that pair. See the [compatibility section](README.md#requirements).
