# MediaPipe production failure investigation

調査日: 2026-09-12 (JST)

対象: BLA-35「本番環境のMediaPipeエラーを再現して原因を特定する」

## 結論

本番で再現できた直接の障害は、MediaPipeの初期化エラーではなく、その前段にあるカメラ選択肢の初期化不全だった。

ブラウザから`navigator.mediaDevices.enumerateDevices()`を直接呼ぶと3台のカメラを取得でき、`getUserMedia()`も640×480、30fpsで成功した。一方、アプリのcamera selectには選択肢が表示されず、MediaPipeのWASMとmodelへのリクエストは発生しなかった。

原因は、`src/lib/createCamera.ts`にある権限要求と非同期デバイス列挙の競合である。初回列挙のPromiseを`onMount()`完了後まで保留するbrowser harnessで、現行実装が`getUserMedia()`を呼ばないことを決定的に再現した。

1. `createDevices()`が`enumerateDevices()`を開始する。
2. Promiseの完了前に`onMount()`が一度だけ実行される。
3. この時点の`cameras()`は空なので、`deviceId === ""`を満たさず、`getUserMedia()`による権限要求を行わない。
4. 権限が未確定のブラウザでは、後から届くデバイス情報のIDとlabelが空になり得る。
5. 空文字のvalueを持つcameraはselectの有効な選択肢として表示されない。
6. 権限が後から付与されても、`devicechange`は保証されず、アプリは再列挙しない。

本番でpermission stateが`prompt`、アプリの選択肢が0件、直接取得は成功という組み合わせは、この再現経路と一致する。MediaPipeの初期化へ到達する前に失敗しているため、WASM、model、CSP、GPUは今回観測した障害の直接原因ではない。

## 再現環境と観測結果

- URL: `https://icon.eyemono.moe/`
- Browser: Chromium 150.0.7871.224 / Windows 10相当のOrca browser profile
- Secure context: 有効
- Camera permission state: `prompt`
- `enumerateDevices()`の直接結果: video input 3台
  - MiraBox Video Capture
  - HD Webcam C525
  - OBS Virtual Camera
- `getUserMedia()`の直接結果: 成功、640×480、30fps
- アプリのcamera select: option 0件
- Console: エラーなし
- Network: MediaPipe loader、WASM、modelへのリクエストなし

本番のGETレスポンスは200だったが、アプリで設定済みのContent-Security-PolicyとPermissions-Policyは配信されていなかった。現行ブランチにはこれらのheaderが存在しbrowser testもあるため、調査時点の状態はBLA-31より古いdeployと整合する。ただしdeploy SHAを確認しておらず、proxyやhosting層でheaderが未適用または除去された可能性も残る。なお、`HEAD /`は500を返したため、監視やヘルスチェックでHEADを使用する場合は別途扱う必要がある。

## production buildとの比較

現行ブランチを`vinxi build --preset node-server`でbuildし、camera selectの既存Playwright testを実行したところ成功した。このtestは最初の`enumerateDevices()`からIDとlabelを持つcameraを返すため、権限付与前の空IDから始まる経路を検証していない。

そこで、調査用の一時的なPlaywright harnessで次の時系列を固定した。

1. camera tabをmountする。
2. 初回`enumerateDevices()`のPromiseを未解決のまま保持し、`onMount()`に空の初期signalを読ませる。
3. `onMount()`完了後に、空のIDとlabelを持つ`videoinput`でPromiseを解決する。
4. 正常仕様として`getUserMedia()`が1回呼ばれることを期待する。

結果は期待値1回に対して0回となり、5秒のpoll timeoutで失敗した。このharnessは調査用のためcommitせず、同じ条件をBLA-36の回帰testとして追加する。

本番bundleと現行sourceは、どちらも次の構造を持つ。

- `enumerateDevices()`をcomponent初期化時に開始する。
- 空IDを見て権限を要求する処理は`onMount()`で一度だけ実行する。
- 権限取得後の再列挙は、その`onMount()`内から権限を要求できた場合に限る。

したがって、UIライブラリ移行とは独立して、デバイス列挙を状態機械として扱う必要がある。

## MediaPipe側に残る問題

camera選択を直すと、次に以下の問題が顕在化する可能性が高い。

### JavaScriptとWASMのversion不一致

packageは`@mediapipe/tasks-vision@0.10.21`に固定されているが、WASMは`@mediapipe/tasks-vision@latest/wasm`から取得している。`FilesetResolver`はSIMD対応によってファイル名を選ぶだけで、bundle済みAPIとのversion整合性を保証しない。

MediaPipe 0.10.21のresolver実装: <https://github.com/google-ai-edge/mediapipe/blob/v0.10.21/mediapipe/tasks/web/core/fileset_resolver.ts.template#L29-L56>

### 初期化失敗がUI stateに反映されない

`FilesetResolver.forVisionTasks()`と`FaceLandmarker.createFromOptions()`の例外は、現在の`getUserMedia().catch()`より前で発生する。CDN、WASM、model、GPU/WebGLのどこかで失敗すると、`cameraState`が`loading`のままになり、利用者にもconsoleにも十分な診断情報が残らない。

### lifecycleと互換性

- videoに`playsinline`がないため、特にiOSでinline camera previewが安定しない。
- camera切替ごとに`loadeddata` listenerとanimation frame loopが増える可能性がある。
- 古い非同期camera requestが新しい選択結果を上書きできる。
- unmount時にtrack、RAF、`srcObject`、`FaceLandmarker.close()`を解放していない。
- `detectForVideo()`は同期処理でmain threadを塞ぐ。Googleはcamera frame inferenceをWeb Workerへ移すことを推奨している。

Face Landmarker web guide: <https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js#run_the_task>

WebKit inline video policy: <https://webkit.org/blog/6784/new-video-policies-for-ios/>

## BLA-36で実装する修正

BLA-36では、一度に配信方式まで変更せず、次の順で直す。

1. camera列挙を`idle`、`enumerating`、`permission-required`、`ready`、`denied`、`unsupported`、`error`として明示する。
2. 初回列挙結果が空IDなら、その結果をreactiveに観測して権限要求へ進む。
3. 権限取得後は必ず再列挙し、空のlabelには安定したfallback名を表示する。
4. MediaPipe初期化、camera取得、video playbackを同じerror経路で処理し、stageと原因をUIおよび診断logへ残す。
5. JSとWASMを同じ`0.10.21`へ固定する。self-hostingは配信先を決めてから別の小さな変更として行う。
6. `playsinline`、古いrequestの無効化、listener/RAF/stream/taskのcleanupを追加する。
7. GPU初期化失敗時のCPU retryを検討する。ただし0.10.21のvision pipeline自体がWebGLを利用するため、完全なWebGL不要fallbackとは扱わない。

## 最小回帰テスト

browser testでは、少なくとも次の順序を再現する。

1. 最初の`enumerateDevices()`のPromiseを`onMount()`完了後まで未解決に保ち、その後で空の`deviceId`とlabelを持つ`videoinput`を返す。
2. アプリが`getUserMedia({ video: true })`を一度だけ呼ぶことを確認する。
3. 権限取得後の`enumerateDevices()`は、IDとlabelを持つcameraを返す。
4. camera optionが表示され、選択できることを確認する。
5. 権限拒否時は無限loadingにならず、再試行可能なerror表示になることを確認する。
6. WASM resolverまたはtask作成をrejectさせ、`cameraState`と診断情報に初期化stageが反映されることを確認する。
7. cameraを素早く切り替え、古いstreamが採用されず、そのstreamのtrackが停止することを確認する。採用された最新streamは動作を継続し、unmount時に停止する。

実機確認ではChromeとSafari、iOS 16以降を最低対象とする。Firefoxを正式対応に含める場合は、権限付与後の再列挙とlabel取得を個別に確認する。
