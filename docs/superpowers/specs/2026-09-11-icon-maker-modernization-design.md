# icon-maker-v2 モダナイゼーション設計

## 目的

本変更は、UI基盤をArk UIへ統一し、既知の脆弱性を含む依存関係を更新できる構成へ移行する。

既存のアイコン編集、URL共有、SVG生成、PNG生成、OGP生成、カメラ連動は外部仕様として維持する。

Solid 2 RCとstart modeは、Ark UIを含む依存関係の互換性を実動作で確認できた場合に採用する。

Cloudflare Workersへの移行は、PNG生成を含む既存URLの互換性と実行コストを検証できた場合に実施する。

## 現状

現在のアプリケーションはSolid 1.9、SolidStart 1、Vinxi、Vite 6、Biome 1で構成されている。

画面はSolidStartのSSRで配信し、画像用routeがサーバー上でSVGを組み立て、SharpでPNGへ変換している。

クライアントではKobalteとArk UIを併用している。

SplitterだけがArk UIを使い、Tabs、Menu、Select、Radio Group、Checkbox、Text Field、Slider、Switch、ToastはKobalteに依存している。

自動テストはなく、現在のCIはformatとlint、型検査、buildだけを検証している。

依存関係の監査では、直接依存のSharpとSVGOを含む既知の脆弱性が検出されている。

SolidStartとVinxiの古い推移依存にも多数の脆弱性が残っている。

クライアントbuildにはSVGOとcss-treeが含まれ、両者だけで約208 KB gzipを占める。

カメラ機能はMediaPipeのWASMをバージョン未固定のURLから読み込み、選択中は各animation frameで顔検出を実行する。

本番環境ではMediaPipeのエラーが発生している可能性があり、原因はまだ確認できていない。

## 採用する構成

### UI primitive

操作、状態、フォーカス管理、キーボード操作、アクセシビリティを持つUI primitiveはArk UIへ統一する。

対象はTabs、Menu、Select、Radio Group、Checkbox、Field、Slider、Switch、Toast、Splitterである。

ButtonはArk UIに対応するprimitiveがないため、ネイティブの`button`を包む薄いmoduleとして維持する。

Loading表示、レイアウト要素、アイコンを構成するSVGパーツはArk UIへ置き換えない。

Kobalteは移行完了後に依存関係から削除する。

### アイコン状態

アイコン状態の既定値、検証、URLへのencode、URLからのdecodeを一つの深いmoduleへ集約する。

このmoduleのinterfaceは、妥当なアイコン状態を生成する操作と、文字列との相互変換だけを公開する。

圧縮文字列の長さと展開後のデータ量を制限し、構造をschemaで検証する。

不正な入力は既定値へ黙って変換せず、呼び出し側が400応答または画面上の復旧処理を選べる結果として返す。

### SVG描画と画像生成

アイコン状態からSVG文字列を生成する処理を、UIのContextとrouteから独立させる。

SVG生成moduleのinterfaceはアイコン状態を受け取り、最適化済みSVGを返す。

通常画像とOGP画像の差は、重複したrouteではなく描画オプションとして表現する。

PNG変換はSVG生成とは別のseamに置く。

Node環境ではSharp adapterを使用し、Cloudflare Workersの検証ではWASMまたはCloudflareの画像機能を使うadapterを比較する。

複数の実装が必要になるため、このseamは実在する差異を隠す役割を持つ。

### Solidのバージョン

最初のUI移行はSolid 1.9上で実施する。

Ark UIへの統一後、Solid 2 RC用の検証環境で画面操作、SSR、hydration、Portal、Toast、履歴、カメラ機能を確認する。

互換性を確認できた場合は、Solid 2 RC、`@solidjs/web`、Solid Router 2、Solid Meta 1、`@solidjs/vite-plugin`を同じ更新単位で導入する。

この更新では旧package export、`batch`、一引数の`createEffect`、`on`、`classList`、旧store setterをSolid 2の仕様へ合わせる。

Ark UIで回避不能な不具合を確認した場合はSolid 1.9を維持し、Solid 2への移行を保留する。

Solid 2へ進めない場合も、UI統一、状態moduleの分離、脆弱性修正、性能改善は完了させる。

### start mode

Solid 2の互換性確認後にSolidStartとVinxiを削除し、`@solidjs/vite-plugin`のstart modeへ移行する。

アプリケーションはSSRを維持する。

その理由は、トップページのOGP metadataと動的favicon、画像生成routeを既存仕様のまま配信するためである。

file-system routingとFetch形式のrequest handlerを使い、ホスティング固有の処理をアプリケーション内部へ持ち込まない。

### Cloudflare Workers

Cloudflareへの移行は、start modeへの移行とは別の決定として扱う。

検証ではCloudflare公式Vite pluginを組み込み、ローカルのWorkers runtimeでSSRと画像routeを実行する。

次の条件をすべて満たした場合に本番移行する。

- `/image`、`/image.png`、`/image.svg`、`/ogp`のURL互換性を維持する。
- SVGとPNGの表示結果、寸法、Content-Type、cache headerを維持する。
- PNG変換がWorkersのCPU時間とmemory制限内で完了する。
- cold startと通常応答時間が現在の配信に対して許容範囲に収まる。
- preview環境で本番切替前の確認ができる。
- DNS切替後にVercelへ戻せる手順を用意する。

PNG adapterが条件を満たさない場合はCloudflare移行を保留し、Vercelでの配信を維持する。

## 性能改善

SVGOは通常の初期表示から分離し、保存またはcopy時にだけ読み込む。

SVGパーツ自体に対するbuild時の最適化も検証し、実行時SVGOを削除できる場合は削除する。

MediaPipeの変更前に、本番環境のエラーを再現し、browser console、network response、権限状態、利用端末を記録して原因を特定する。

原因特定後、必要に応じてカメラ選択後の遅延読み込みと、WASMおよびmodelのversion固定または管理対象assetからの配信を実施する。

顔検出はvideo frameの更新に合わせ、処理中の重複呼び出しを防ぐ。

カメラ変更または画面破棄時にはMediaStream、animation frame、event listener、FaceLandmarkerを解放する。

URLへの自動保存は状態変更をまとめ、history更新とserializationの回数を抑える。

bundle sizeはCIで記録し、主要chunkの予期しない増加を検出できるようにする。

## セキュリティ改善

SharpとSVGOは修正版へ更新する。

既存のDependabot設定を拡張し、version updateを継続的に作成する。

GitHub repositoryでDependabot alertsとsecurity updatesが有効化されていない場合は、repository設定で有効化する。

pull requestではGitHubのDependency Reviewを実行し、追加されるcriticalまたはhighの既知脆弱性を検出した場合にmergeを止める。

画像queryは文字数、展開後サイズ、schema、画像寸法を検証する。

MediaPipeの配信元が原因またはサプライチェーン上のriskになる場合は、WASMとmodelを固定したversionまたは管理対象assetから配信する。

HTMLと画像応答にはContent Security Policy、`X-Content-Type-Options`、Referrer Policy、Permissions Policyを設定する。

カメラ権限は必要な画面操作後にだけ要求する。

SVG応答は生成済みの信頼できる要素だけを含み、外部入力をmarkupとして埋め込まない。

## 開発環境

Node.jsはVite+の要件を満たすversionへ固定する。

Vite+への移行ではVite 8以上へ更新し、formatをOxfmt、lintをOxlintへ置き換える。

`vp check`、test、buildをローカルとCIで同じ順序で実行する。

CIは同じ依存installを複数jobで繰り返さない構成へ変更する。

deployは品質検査に成功したmain branchだけを対象にし、previewとproductionを区別する。

READMEには必要なNode.js、導入、開発、test、build、deploy、画像URLの仕様を記載する。

## テスト方針

テストは実装の内部構造ではなく、各moduleのinterfaceと利用者が観測できる動作を確認する。

状態moduleでは既定値、round trip、旧URL互換性、不正入力、最大サイズを検証する。

SVG生成moduleでは代表的な状態のsnapshotと、参照IDが壊れていないことを検証する。

画像routeではstatus、Content-Type、cache header、寸法、既存URLを検証する。

UIではキーボード操作、focus移動、選択、reset、undo、redo、URL保存、Toastをbrowser testで確認する。

カメラmoduleではMediaStreamと顔検出器をadapter越しに差し替え、開始、切替、失敗、停止、cleanupを確認する。

MediaPipeでは本番エラーの再現条件を回帰testとして残し、原因に対応するbrowserまたはintegration testを追加する。

Solid 2の互換性判定では、同じbrowser testをSolid 1.9とSolid 2 RCで実行する。

Cloudflare検証ではWorkersのローカルruntimeとpreview環境に対して画像routeのcontract testを実行する。

## 実施順序

1. 現行動作を固定するtest基盤を追加する。
2. 直接依存の脆弱性を修正する。
3. Kobalte製UIをArk UIへ段階的に置き換える。
4. Kobalteを削除し、アクセシビリティのbrowser testを通す。
5. アイコン状態moduleを分離し、入力制限とschema検証を追加する。
6. SVG生成moduleとPNG adapterのseamを作る。
7. 画像routeの重複を統合する。
8. 本番環境のMediaPipeエラーを再現し、原因を特定する。
9. 原因に応じてMediaPipeの読み込み、配信、lifecycleを改善する。
10. SVGOを初期bundleから分離する。
11. Solid 2 RCとArk UIの互換性を検証する。
12. 合格した場合はSolid 2 RCへ移行する。
13. SolidStartとVinxiをstart modeへ置き換える。
14. Vite+、Oxfmt、Oxlintへ移行する。
15. Cloudflare Workers上のPNG adapterを検証する。
16. 合格した場合はCloudflareへdeployする。
17. CI、依存更新、セキュリティ検査、文書を更新する。

各段階は単独でtest、型検査、buildを通し、次の段階へ進める状態で完了させる。

## 対象外

新しい顔パーツ、編集機能、保存形式、認証、永続databaseは追加しない。

画面の視覚デザインはArk UI移行に必要な差を除いて変更しない。

Solid 2のserver component previewは採用しない。

Cloudflare固有のstorageやqueueは導入しない。

既存URLを移行期間中に廃止しない。

## 参考資料

- [Solid 2.0 RC: The Big Reveal](https://www.solidjs.com/blog/solid-2-0-rc-the-big-reveal)
- [Migrating from Solid 1.x](https://v2.solidjs.com/migration/from-solid-1)
- [Migrating from SolidStart](https://v2.solidjs.com/migration/from-solid-start)
- [Solid 2 deployment](https://v2.solidjs.com/building-apps/deployment)
- [Cloudflare Workers Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
