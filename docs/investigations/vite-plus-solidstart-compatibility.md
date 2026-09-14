# Vite+とSolidStart 1の互換性

## 判定

2026年9月13日時点では、Vite+を本番toolchainへ採用しない。

`vite-plus@0.3.1`が内包するVite 8.2.2へ差し替えると、現行の`vinxi build`がUnoCSS plugin内で失敗する。
そのため、Vite+がbuildを所有できる場合だけ採用するというgateを満たさない。

productionは`solid-js@1.9.5`、`@ark-ui/solid@4.10.2`、`@solidjs/start@1.1.1`、`vinxi@0.5.3`を維持する。
formatとlintはVite+から独立して導入できる`oxfmt@0.67.0`と`oxlint@1.82.0`へ移行する。

## 検証したversion

検証時のnpm registryとVite+自身が報告したversionは次のとおりである。

```sh
pnpm view vite-plus version engines dependencies --json
pnpm view @voidzero-dev/vite-plus-core version engines peerDependencies --json
pnpm view vinxi@0.5.3 peerDependencies dependencies.vite --json
pnpm view @solidjs/start@1.1.1 peerDependencies dependencies.vinxi --json
pnpm view oxfmt version engines --json
pnpm view oxlint version engines --json
```

| 対象               | versionまたは範囲                     |
| ------------------ | ------------------------------------- |
| Node.js            | 24.11.0                               |
| pnpm               | 9.6.0                                 |
| `vite-plus` latest | 0.3.1                                 |
| Vite+内のVite      | 8.2.2                                 |
| Vite+内のRolldown  | 1.2.7                                 |
| `vitest`           | 4.1.11                                |
| `vinxi`            | 0.5.3。Vite peer dependencyは`^6.0.0` |
| `@solidjs/start`   | 1.1.1。`vinxi` dependencyは`^0.5.3`   |
| `oxfmt` latest     | 0.67.0                                |
| `oxlint` latest    | 1.82.0                                |

Vite+の公式troubleshootingはVite 8以上とVitest 4.1以上を前提にしている。
現行のVitestは要件を満たすが、VinxiのVite peer rangeは満たさない。
ただし、peer rangeだけでは実装上の互換性を判定できないため、実際のproduction buildまで検証した。

## Import sortingの保留

Biomeで有効にしていた`organizeImports`に相当する機能として、Oxfmt 0.67.0は`sortImports`を提供している。
しかし、`sortImports: true`を一時的に指定して`pnpm format:check`を実行すると、既存の60 filesが変更対象になった。
CI workflowの修正へrepository全体のimport reorderを混在させると差分の検証範囲が広がるため、この変更では`sortImports`を有効にしない。
Import sortingは、60 filesの変更を単独でreviewして全testを実行できる更新単位まで保留する。

## 再現手順

integration commit `7bc3d3e`から一時directoryを作り、repositoryを変更せずにmigrationを試した。

```sh
trial_dir=$(mktemp -d /tmp/icon-maker-vite-plus-XXXXXX)
git archive 7bc3d3e | tar -x -C "$trial_dir"
cd "$trial_dir"
pnpm install --frozen-lockfile
pnpm --package=vite-plus@0.3.1 dlx vp migrate \
  --no-interactive --no-agent --no-editor --no-hooks
```

`vp migrate`は`vite-plus@0.3.1`、`vite` alias、Vitest overrideを追加し、15個のtestとconfigのimportを書き換えた。
一方、生成された`pnpm-workspace.yaml`には`catalog`だけがあり、pnpm 9.6.0は`packages field missing or empty`でinstallを拒否した。

このmigration側の停止だけで採用可否を決めないため、`pnpm-workspace.yaml`へ次のworkspace rootを加えて検証を続けた。

```yaml
packages:
  - .
```

その後、次のコマンドを実行した。

```sh
pnpm install --no-frozen-lockfile
pnpm exec vp toolchain
pnpm exec vp check --fix
pnpm type
pnpm exec vp test run
pnpm exec vinxi build
```

結果は次のとおりである。

| gate             | 結果                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| install          | 完了。ただしVite+ coreが要求するesbuild 0.27系または0.28系に対し、現行graphの0.20.2を解決したpeer warningが残った |
| `vp check --fix` | 失敗。既存tsconfigが除外するSolid 2 reproductionも型検査し、13 errorsと11 warningsを報告した                      |
| `pnpm type`      | 成功                                                                                                              |
| `vp test run`    | 13 files、56 testsが成功                                                                                          |
| `vinxi build`    | 失敗                                                                                                              |

production buildの失敗はSSR routerのcompile中に再現した。

```text
[plugin unocss:global:build:scan]
TypeError: cssPlugins.get(...).transform.call is not a function
```

stack traceは`@unocss/vite@66.0.0`の`applyCssTransform`から、Vite+ coreのRolldown plugin adapterを経由していた。
同じcommitを通常のVite 6.1.1で実行した`pnpm build`は成功したため、アプリケーションcodeの一般的なbuild failureとは区別できる。

## 再評価条件

次の条件をすべて満たすreleaseでVite+を再評価する。

- `vinxi`または後継の維持対象frameworkがVite 8以上をpeer dependencyとして受け入れる。
- UnoCSSのVite pluginを含むSolidStart production buildが、Vite+のRolldown pathで成功する。
- `vp check`がrootのTypeScript project境界を尊重し、互換性reproductionを意図せず型検査しない構成を確認できる。
- `vp check`、`pnpm type`、unit test、browser test、production build、bundle budgetが同じlockfileで成功する。

Ark UIがSolid 2へ対応してSolidStartとVinxiを削除できる場合も再評価する。
この場合はstart modeの新しいbuild ownershipに対して別の互換性gateを実行する。

## 一次資料

- [Vite+ migration guide](https://viteplus.dev/guide/migrate)
- [Vite+ supported tool versions](https://github.com/voidzero-dev/vite-plus/blob/main/docs/guide/troubleshooting.md)
- [vite-plus 0.3.1 registry metadata](https://registry.npmjs.org/vite-plus/0.3.1)
- [Vite+ core 0.3.1 registry metadata](https://registry.npmjs.org/@voidzero-dev%2fvite-plus-core/0.3.1)
- [Vite+ releases](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.1)
- [vinxi 0.5.3 registry metadata](https://registry.npmjs.org/vinxi/0.5.3)
- [@solidjs/start 1.1.1 registry metadata](https://registry.npmjs.org/@solidjs%2fstart/1.1.1)
- [Oxfmt configuration](https://oxc.rs/docs/guide/usage/formatter/config)
- [Oxlint configuration](https://oxc.rs/docs/guide/usage/linter/config)
- [oxfmt 0.67.0 registry metadata](https://registry.npmjs.org/oxfmt/0.67.0)
- [oxlint 1.82.0 registry metadata](https://registry.npmjs.org/oxlint/1.82.0)
