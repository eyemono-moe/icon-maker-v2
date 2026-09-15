# Cloudflare Workersへの適合性

## 判定

2026年9月15日時点では、Cloudflare Workersへの本番移行（BLA-42）はまだ着手しない。

Cloudflare Vite pluginは現行のSolidStart 1とVinxiで動かない。
一方、Nitroの`cloudflare-module` presetを使う経路では、local Workers runtimeでSSR、SVG、PNG、OGPがすべて動き、既存の画像route contractを満たした。
previewでもcontractを満たし、CPU時間を実測した。
しかし、採用条件のうち次の点が未確認であり、合格とは判定しない。

- memory使用量。
- responseのcache設計と、それを含めた費用見積もり。
- Vercelへのrollback手順の検証。

previewで測ったPNG生成のCPU時間は、400×400で85ms、OGPで116msだった（いずれもp50）。
Free planの上限10msを大きく超えるため、Cloudflareへ移行する場合はWorkers Paid planが前提になる。

## 検証したversion

| 対象                      | version                               |
| ------------------------- | ------------------------------------- |
| 起点commit                | `338f2f1`                             |
| Node.js                   | 24.11.0                               |
| `@solidjs/start`          | 1.1.1                                 |
| `vinxi`                   | 0.5.3。内部のViteは6.1.1              |
| `nitropack`               | 2.10.4。`unenv`は1.10.0               |
| `@cloudflare/vite-plugin` | 1.54.9。Vite peer rangeは`^6.1.0`以上 |
| `wrangler`                | 4.131.2。`pnpm dlx`で実行             |
| `@resvg/resvg-wasm`       | 2.6.2                                 |

## Cloudflare Vite pluginの非互換

Vite peer rangeは満たしているが、`app.config.ts`のVite pluginへ`cloudflare()`を追加すると、buildとdevの両方が失敗した。

buildでは、pluginがclient environmentの出力先を`.vinxi/build/client/_build/client/`へ変更する。
Vinxiはclient manifestを`.vinxi/build/client/_build/.vite/manifest.json`に固定して読むため、Nitro server buildの段階で失敗する。

```text
[vinxi] ERROR Could not load virtual:.../$vinxi/prod-app: ENOENT: no such file or directory,
open '.../.vinxi/build/client/_build/.vite/manifest.json'
```

devでは、`vinxi dev`が`socket hang up`を出して応答しなかった。
pluginを外した同じ手順では`/`、`/image?f=svg`、`/image?f=png`がすべて200を返したため、原因はpluginの追加にある。

Vinxiはrouterごとに独立したVite buildを行い、最後にNitroで統合する。
Cloudflare Vite pluginはVite Environment APIでWorker environmentを所有する前提なので、この構成へ組み込めない。

## Nitro presetによる経路

SolidStart 1が標準で持つNitroの`cloudflare-module` presetを使うと、buildとlocal Workers runtimeでの起動に成功した。
`SERVER_PRESET=cloudflare-module`のときだけ、`app.config.ts`で次の設定を有効にする。
未指定時は従来どおり`vercel` presetでbuildし、sharpのnative packageもコピーする。

- **PNG encoderの差し替え**：Workersはsharpのnative bindingを読み込めない。画像routeは`~/image/runtime-png-encoder`を参照し、Vite pluginがWorkers向けbuildでだけ`runtime-png-encoder.workers.ts`へ解決する。
- **wasmのbundle**：`experimental.wasm`を有効にし、`@resvg/resvg-wasm/index_bg.wasm?module`をVite buildでexternalにしてNitroへ渡す。
- **AsyncLocalStorage**：SolidStartはrequest contextをAsyncLocalStorageに保持する。Nitro 2.10の`unenv`は`node:async_hooks`を中身のない実装へ置き換えるため、全routeが`Context is not available`で500になった。`node:async_hooks`をexternalにし、workerdの`nodejs_compat`を使う。

### wranglerをproject依存にしない理由

`wrangler`または`@cloudflare/vite-plugin`をdevDependencyに入れると、両者が依存する`unenv@2.0.0-rc.24`がpnpmのhoist先を占める。
Nitro 2.10.4は`unenv@1.10.0`のpathを前提にaliasを張るため、crosswsの`node:buffer`解決が2.0側へ向かい、buildが失敗した。

```text
Could not load .../unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/runtime/node/buffer/index.mjs
(imported by .../crossws@0.3.4/...)
```

このため、検証では`pnpm dlx wrangler@4.131.2`で実行する。

### Workers用PNG adapter

`WorkersPngEncoder`は`@resvg/resvg-wasm`でSVGをrasterizeする。
sharp版の`extend({ extendWith: "copy" })`に合わせ、正方形でない出力では端のpixelを複製してpaddingし、PNGは`CompressionStream("deflate")`でencodeする。
生成するSVGは文字を`<text>`ではなくpathで持つため、wasm環境でfontを用意する必要はない。

unit testでは、既定のicon（400×400）、padding付きicon（300×200）、OGP（1000×525）で、sharp版とのRGBA平均絶対誤差が2未満であることを確認した。

検証の途中で、OGPだけiconの位置がずれる問題が見つかった。
svgoの`collapseGroups`が`<g transform="translate(81,62.5)">`を畳み、`transform`を入れ子の`<svg>`へ移していた。
SVG 1.1では入れ子の`<svg>`の`transform`は無効であり、librsvgを使うsharpは反映するがresvgは無視する。
OGPのtemplateを`<svg x="81" y="62.5">`による配置へ変更し、両adapterで同じ出力になった。

## 画像route contract

`tests/worker/image-contract.test.ts`は、起動済みserverに対してHTTPでcontractを検証する。

```sh
pnpm build:cloudflare
pnpm preview:cloudflare
IMAGE_CONTRACT_BASE_URL=http://127.0.0.1:8787 pnpm test:contract
```

SVGとPNGのContent-Type、Cache-Control、PNG寸法、encode済みstateの描画、不正queryの400、HTMLのCSP nonceと`Permissions-Policy: camera=(self)`を確認する。
local Workers runtime（`wrangler dev`）とNode build（`pnpm build:test`と`vinxi start`）の両方で13件すべて成功した。
`IMAGE_CONTRACT_BASE_URL`が未設定のときは、通常の`pnpm test`でskipされる。

## 測定結果

測定はWSL2上のlocal環境で行った。
各pathへ3回warm-upした後に30回requestし、`curl`の`time_total`を集計した。
`wrangler dev`は前段にproxyを挟むため、Workers側の値には数msのoverheadが含まれる。

| path                  | Workers p50 | Workers p90 | Node(sharp) p50 | Node(sharp) p90 |
| --------------------- | ----------- | ----------- | --------------- | --------------- |
| `/`                   | 8.9ms       | 9.7ms       | 3.0ms           | 3.5ms           |
| `/image?f=svg`        | 8.9ms       | 9.7ms       | 1.8ms           | 2.2ms           |
| `/image?f=png`        | 27.1ms      | 28.2ms      | 9.8ms           | 10.5ms          |
| `/image?f=png&s=1024` | 119.4ms     | 120.8ms     | 35.5ms          | 45.1ms          |
| `/ogp`                | 50.0ms      | 51.2ms      | 23.2ms          | 24.1ms          |

PNG生成は同期的なrasterizeが大半を占めるため、Workers側の実時間はCPU時間に近い可能性が高い。
400×400でも約20ms以上かかっており、Free planの10msには収まらない見込みである。
Paid planの既定値30秒には十分収まる。

cold startは、`wrangler dev`を再起動した直後の最初のPNG requestで測った。
4回とも約80msで、2回目以降の約30msとの差（約50ms）は、isolateの起動とwasmのcompileおよび初期化によるものと考えられる。
Node buildではprocess起動後の最初のPNG requestが約23msだったが、Vercel上のcold startはfunctionの起動を含むため、この値とは直接比較できない。

bundle sizeは`.output/server`がsource mapを除いて4.2MBであり、Workersの上限（非圧縮で64MiB）に収まる。
memoryはlocalのworkerdではisolate単位で測れないため、未測定である。
上限は128MBで、1024×1024のRGBA bufferは約4MBである。

Cloudflareの上限値は、2026年9月15日に[Workers limits](https://developers.cloudflare.com/workers/platform/limits/)で確認した。

## previewでの測定結果

2026年9月15日に、同じbuildを`icon-maker-preview.eyemono-moe.workers.dev`へdeployした。
Worker Startup Timeは26msで、上限の1秒に収まった。
previewに対して`pnpm test:contract`を実行し、13件すべて成功した。

CPU時間は`wrangler tail --format json`の`cpuTime`から集計した。
cacheを避けるためにqueryへ乱数を付け、各pathへ12回requestした。

| path                  | CPU p50 | CPU max | 結果       |
| --------------------- | ------- | ------- | ---------- |
| `/`                   | 8ms     | 54ms    | すべて`ok` |
| `/image?f=svg`        | 17ms    | 115ms   | すべて`ok` |
| `/image?f=png`        | 85ms    | 274ms   | すべて`ok` |
| `/image?f=png&s=1024` | 309ms   | 434ms   | すべて`ok` |
| `/ogp`                | 116ms   | 206ms   | すべて`ok` |

本番のCPU時間はlocalの実時間より3倍程度大きい。
localの値からFree planの10msを超えると見込んでいたが、実測では400×400のPNGでも85msかかり、見込みより大きく超えた。
maxは最初のrequestで大きくなる傾向があり、isolateの起動とwasmの初期化を含むと考えられる。

## 残作業と再評価の条件

BLA-42へ進むには、次の項目を確認する必要がある。

- accountのplanを確認する。previewではCPU時間が300msを超えるrequestも`ok`で終わったが、planはwranglerの出力から確認できていない。
- Workersが返したresponseは、Cache APIを使うかcustom domainでCache Ruleを設定しない限りCDNにcacheされないはずである。PNGのCPU時間が大きいため、cacheの設計を費用見積もりに含める。
- memory使用量が128MBの上限に対して十分な余裕を持つことを確認する。`wrangler tail`の出力には含まれない。
- DNSをVercelへ戻すrollback手順を記録し、切替前後を検証する。

Vinxiを使わないstart modeへ移行できた場合は、Cloudflare Vite pluginによる経路を再評価する。
このrepositoryではstart modeへの移行をSolid 2と一体でBLA-39として見送っているため、再評価の時期はBLA-39の再開条件（Ark UIのSolid 2対応）に連動する。
