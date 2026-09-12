# Solid 2 RCとArk UIの互換性

## 判定

2026年9月13日時点では、Solid 2 RCを本番採用しない。

現在公開されているArk UIはSolid 2 RCと互換ではなく、型検査とproduction buildの両方が失敗する。

Solid 1.9の構成を維持し、Ark UIがSolid 2を正式にサポートしたreleaseで互換性gateを再実行する。

## 固定したversion matrix

Solid 2候補は、npm registryの`next` tagと各packageのpeer dependencyが一致する次の組み合わせに固定した。

| package | 検証version | 根拠 |
| --- | --- | --- |
| `solid-js` | `2.0.0-rc.8` | npmの`next` tag |
| `@solidjs/web` | `2.0.0-rc.8` | `solid-js`と同じRC |
| `@solidjs/router` | `2.0.0-next.24` | npmの`next` tag。peer dependencyは`solid-js`と`@solidjs/web`の`^2.0.0-rc.8` |
| `@solidjs/meta` | `1.0.0-next.2` | npmの`next` tag。peer dependencyは`solid-js`と`@solidjs/web`の`^2.0.0-rc.0` |
| `@ark-ui/solid` | `5.39.1` | npmの`latest` tag |

Solid 2では`solid-js/web`が独立packageの`@solidjs/web`へ移ったため、両者を別項目としている。

採用を見送ったため、productionは次の実動作確認済みmatrixを維持する。

| package | production version |
| --- | --- |
| `solid-js`および`solid-js/web` subpath | `1.9.5` |
| `@solidjs/router` | `0.15.3` |
| `@solidjs/meta` | `0.29.4` |
| `@ark-ui/solid` | `4.10.2` |

## Ark UIで再現した不互換

最小reproductionは[`reproductions/solid-2-ark-ui`](../../reproductions/solid-2-ark-ui/README.md)に置いた。

アプリケーション固有の移行箇所とSolidStartを除外し、Ark UIのMenu、Portal、ToastだけをSolid 2のcompilerでbuildする構成である。

`pnpm install --ignore-workspace`は、Ark UIが依存する`@solid-primitives/keyed@1.5.3`について`solid-js@^1.6.12`のpeer dependency不一致を報告した。

`pnpm type`は、`@ark-ui/solid@5.39.1`と`@zag-js/solid@1.43.3`がSolid 2で削除された`solid-js`の`JSX` exportを参照するため失敗した。

`pnpm build`は次の解決errorで失敗した。

```text
"./web" is not exported ... from package solid-js
```

Ark UIと`@solid-primitives/keyed`の配布codeが`solid-js/web`をimportしている一方、Solid 2はWeb runtimeを`@solidjs/web`へ移している。

Ark UIの`solid-js >=1.6.0`というpeer rangeはSolid 2もsemver上は許容するが、配布codeはSolid 1のpackage構成を前提としている。

そのため、peer rangeだけを根拠に互換と判断できない。

Ark UI maintainerもSolid 2対応を次のmajor releaseのroadmapとして回答しており、Ark UI 5系を互換releaseとして扱う根拠はない。

## 実動作gate

Solid 2候補はproduction buildに到達しないため、SSR、hydration、Portal、Menu、Toast、history、cameraのbrowser testを実行できなかった。

ここでアプリケーションcodeまでSolid 2へ書き換えるとBLA-39のStart Mode移行と混ざり、Ark UI単体の不互換を隠してしまう。

代わりにSolid 1.9のproduction buildに対して既存browser suiteを実行し、次を確認した。

| 項目 | 結果 |
| --- | --- |
| SSR | response HTMLに`eyemono.svg`を確認 |
| hydration mismatch | 0件 |
| PortalおよびMenu | keyboard、hover、nested menuのtestが成功 |
| Toast | SVG copy後のsuccess Toastが成功 |
| history | URL保存、reload、undo、redoが成功 |
| camera | device選択、permission、keyboard操作、error表示が成功 |

browser consoleではhydration mismatchは0件だったが、初期load時にCSPが`unsafe-eval`を拒否したerrorを1件記録した。

これはSolid 2候補へ進む前から存在するfallback側の問題であり、Ark UIの互換性判定とは別に解消する必要がある。

## 再判定の条件

Ark UIがSolid 2対応を明記し、配布codeから`solid-js/web`と`solid-js`の`JSX`参照がなくなったreleaseで再判定する。

再判定ではこのreproductionの型検査とbuildを先に通し、その後に同じapplication browser suiteでconsole errorとhydration mismatchがともに0件であることを確認する。

## 一次資料

- [Solid 2.0 RC発表](https://github.com/solidjs/solid/discussions/2995)
- [Solid Router releases](https://github.com/solidjs/solid-router/releases)
- [Ark UI maintainerによるSolid 2対応方針](https://github.com/chakra-ui/ark/discussions/3814)
- [solid-js 2.0.0-rc.8 registry metadata](https://registry.npmjs.org/solid-js/2.0.0-rc.8)
- [@solidjs/web 2.0.0-rc.8 registry metadata](https://registry.npmjs.org/@solidjs%2fweb/2.0.0-rc.8)
- [@solidjs/router 2.0.0-next.24 registry metadata](https://registry.npmjs.org/@solidjs%2frouter/2.0.0-next.24)
- [@solidjs/meta 1.0.0-next.2 registry metadata](https://registry.npmjs.org/@solidjs%2fmeta/1.0.0-next.2)
- [@ark-ui/solid 5.39.1 registry metadata](https://registry.npmjs.org/@ark-ui%2fsolid/5.39.1)
