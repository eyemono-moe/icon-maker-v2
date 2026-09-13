# Icon Maker Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存機能と画像URLを維持しながら、Ark UI、Solid 2 RC、start mode、Vite+を軸にicon-maker-v2を段階的に更新する。

**Architecture:** 状態codec、SVG renderer、PNG encoder、camera runtimeをUIとrouteから分離し、それぞれを狭いinterfaceとcontract testで保護する。Solid 2とCloudflareは検証gateを設け、互換性または画像生成要件を満たせない場合にSolid 1.9またはVercelを維持できる順序で進める。

**Tech Stack:** Solid 1.9からSolid 2 RC、Ark UI、Solid Router、Solid start mode、Vite+、Oxc、Vitest、Playwright、Valibot、Sharp、MediaPipe、GitHub Actions、Dependabot、Cloudflare Workers

**Spec:** `docs/superpowers/specs/2026-09-11-icon-maker-modernization-design.md`

## Global Constraints

- `/image`、`/image.png`、`/image.svg`、`/ogp`のURLと観測可能な応答契約を維持する。
- UI primitiveはArk UIへ統一し、Ark UIに存在しないButtonだけnative wrapperを維持する。
- Ark UIとSolid 2 RCの互換性を実動作で確認できない場合はSolid 1.9を維持する。
- Cloudflare移行はPNG生成、応答時間、rollback条件を満たした場合だけ実施する。
- MediaPipeは本番エラーの原因を特定してから配信方法を変更する。
- 各課題はtest、型検査、buildを単独で通せる状態で完了する。

---

### Task 1: 現行動作を固定するtest基盤

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/lib/query.test.ts`
- Create: `tests/browser/editor.spec.ts`

**Interfaces:**

- Produces: `pnpm test`、`pnpm test:browser`、既存URLと編集操作のcharacterization test

- [ ] Vitestでqueryのencode/decode round tripを固定するtestを書き、現状の境界条件で失敗することを確認する。
- [ ] Playwrightで初期表示、パーツ選択、undo、redo、URL更新を確認するbrowser testを書く。
- [ ] `test`と`test:browser` scriptを追加し、test用serverを既存buildから起動する。
- [ ] `pnpm test && pnpm test:browser && pnpm run type && pnpm run build`を実行する。
- [ ] `test: characterize existing editor behavior`としてcommitする。

### Task 2: 直接依存の脆弱性と依存更新automation

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.github/dependabot.yml`
- Create: `.github/workflows/dependency-review.yml`
- Modify: `src/app.tsx`
- Modify: `src/routes/image.tsx`
- Modify: `src/routes/ogp.tsx`
- Modify: `vercel.json`
- Modify: `README.md`

**Interfaces:**

- Consumes: Task 1のtest commands
- Produces: 修正版SharpとSVGO、Dependabot version updates、critical/high追加を拒否するDependency Review、HTMLと画像のsecurity headers

- [ ] SharpとSVGOの現行脆弱性を再現するaudit結果を記録する。
- [ ] browserとserverの既存動作を壊さない修正版へ直接依存を更新する。
- [ ] Dependabotの更新頻度とgroupを調整し、GitHub Dependency Review workflowを追加する。
- [ ] Content Security Policy、`X-Content-Type-Options`、Referrer Policy、Permissions PolicyをHTMLと画像応答へ追加する。
- [ ] `pnpm install --frozen-lockfile && pnpm test && pnpm run type && pnpm run build`を実行する。
- [ ] `fix: update vulnerable dependencies`としてcommitする。

### Task 3: UI primitiveをArk UIへ統一

**Files:**

- Modify: `src/components/Settings.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Actions.tsx`
- Modify: `src/components/UI/ColorField.tsx`
- Modify: `src/components/UI/PartsSelect.tsx`
- Modify: `src/components/UI/Select.ts`
- Modify: `src/components/UI/_Select.tsx`
- Modify: `src/components/UI/SensitivityRange.tsx`
- Modify: `src/components/UI/Switch.tsx`
- Modify: `src/lib/toast.tsx`
- Modify: `src/assets/menubar.css`
- Modify: `src/assets/select.css`
- Modify: `src/assets/toast.css`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `tests/browser/editor.spec.ts`

**Interfaces:**

- Consumes: Task 1のbrowser test
- Produces: Ark UIだけを使うTabs、Menu、Select、Radio Group、Checkbox、Field、Slider、Switch、Toast、Splitter

- [ ] keyboard、focus、selection、Toastの現在の振る舞いをbrowser testへ追加する。
- [ ] primitiveを一種類ずつArk UIへ置換し、既存CSS contractを維持する。
- [ ] native Button wrapperを維持し、Kobalte importが0件であることを`rg '@kobalte' src`で確認する。
- [ ] Kobalteを削除して`pnpm test:browser && pnpm run type && pnpm run build`を実行する。
- [ ] `refactor: standardize UI primitives on Ark UI`としてcommitする。

### Task 4: アイコン状態codecを分離して入力を制限

**Files:**

- Create: `src/domain/icon-state.ts`
- Create: `src/domain/icon-state-codec.ts`
- Create: `src/domain/icon-state-codec.test.ts`
- Modify: `src/lib/query.ts`
- Modify: `src/lib/imageQuerySchema.ts`
- Modify: `src/context/iconColors.tsx`
- Modify: `src/context/iconTransforms.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/routes/image.tsx`
- Modify: `src/routes/ogp.tsx`

**Interfaces:**

- Produces: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`、`decodeIconState(input: string): Result<IconState, IconStateDecodeError>`、`encodeIconState(state: IconState): string`

- [ ] 既定値、round trip、旧URL、不正schema、圧縮入力上限、展開後上限の失敗testを書く。
- [ ] `IconState` schemaとcodecを実装し、decode failureを型で返す。
- [ ] Contextとrouteをcodecへ接続し、不正な画像queryへ400を返す。
- [ ] `pnpm test && pnpm test:browser && pnpm run type && pnpm run build`を実行する。
- [ ] `refactor: isolate validated icon state codec`としてcommitする。

### Task 5: SVG rendererとPNG adapterを分離して画像routeを統合

**Files:**

- Create: `src/image/render-svg.tsx`
- Create: `src/image/render-svg.test.tsx`
- Create: `src/image/png-encoder.ts`
- Create: `src/image/sharp-png-encoder.ts`
- Create: `src/image/image-response.ts`
- Create: `src/image/image-response.test.ts`
- Modify: `src/lib/ssrSvgStr.tsx`
- Modify: `src/lib/image.ts`
- Modify: `src/routes/[...404].tsx`
- Modify: `src/routes/image.tsx`
- Modify: `src/routes/ogp.tsx`

**Interfaces:**

- Consumes: `IconState`
- Produces: `renderIconSvg(state, options): string`、`PngEncoder.encode(svg, dimensions): Promise<Uint8Array>`、`createImageResponse(request, encoder): Promise<Response>`

- [ ] SVG snapshotと画像routeのstatus、Content-Type、cache header、寸法を固定するcontract testを書く。
- [ ] UI Contextから独立したSVG rendererとSharp PNG adapterを実装する。
- [ ] 通常画像とOGPの差をrenderer optionへ集約し、route重複を削除する。
- [ ] `pnpm test && pnpm test:browser && pnpm run type && pnpm run build`を実行する。
- [ ] `refactor: isolate image rendering pipeline`としてcommitする。

### Task 6: 本番MediaPipeエラーを調査

**Files:**

- Create: `docs/investigations/mediapipe-production-error.md`
- Modify: `src/context/faceDetect.tsx` only when diagnostic logging is required

**Interfaces:**

- Produces: 再現条件、browser console、network response、権限状態、端末情報、root cause、Task 7の決定済み修正方針

- [ ] 本番URLでcamera起動を再現し、consoleとnetworkを記録する。
- [ ] local production buildでも同じ操作を行い、本番固有かcode固有かを切り分ける。
- [ ] WASM取得、model取得、CSP、camera permission、MediaPipe初期化を順に検証する。
- [ ] 原因と最小の回帰test案を調査文書へ記録する。
- [ ] `docs: diagnose production MediaPipe failure`としてcommitする。

### Task 7: MediaPipe runtimeを修正してcleanupを保証

**Files:**

- Create: `src/camera/face-landmarker.ts`
- Create: `src/camera/face-landmarker.test.ts`
- Modify: `src/context/faceDetect.tsx`
- Modify: `src/lib/createCamera.ts`
- Modify: `src/components/settings/CameraSettings.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Task 6のroot cause
- Produces: `FaceLandmarkerAdapter`、`CameraSession.start()`、`CameraSession.stop()`

- [ ] Task 6の再現条件とstart、switch、failure、stop、cleanupの失敗testを書く。
- [ ] MediaPipeをcamera選択後に読み込み、同時推論を一つに制限するadapterを実装する。
- [ ] root causeが配信にある場合だけWASMとmodelを固定versionまたは管理assetへ切り替える。
- [ ] MediaStream、animation frame、listener、FaceLandmarkerの解放を検証する。
- [ ] `fix: stabilize MediaPipe camera runtime`としてcommitする。

### Task 8: 初期bundleと状態保存処理を軽量化

**Files:**

- Modify: `src/lib/saveImage.ts`
- Modify: `src/lib/svg.ts`
- Modify: `src/context/iconColors.tsx`
- Modify: `src/context/iconTransforms.tsx`
- Modify: `package.json`
- Create: `scripts/check-bundle-size.mjs`

**Interfaces:**

- Consumes: Task 4のcodec、Task 5のrenderer
- Produces: 遅延読込されるSVG最適化、debounceされたURL保存、bundle budget check

- [ ] 現在の主要chunk sizeとhistory更新回数を測定するtestを追加する。
- [ ] SVGOを保存またはcopy pathへ遅延読込し、可能ならbuild時最適化へ移す。
- [ ] 状態serializationとhistory更新を一回のdebounce処理へまとめる。
- [ ] `pnpm run build`後に主要chunk budgetを検証するscriptを実行する。
- [ ] `perf: reduce initial bundle and history work`としてcommitする。

### Task 9: Solid 2 RCとArk UIの互換性gate

**Files:**

- Create: `docs/investigations/solid-2-ark-ui-compatibility.md`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `tests/browser/editor.spec.ts`

**Interfaces:**

- Consumes: Task 3のArk UI画面、Task 1のbrowser test
- Produces: Solid 2採用可否、失敗時の最小reproduction、確定したversion matrix

- [ ] Solid 2 RC、`@solidjs/web`、Router 2、Meta 1、Ark UIの検証branchを作る。
- [ ] SSR、hydration、Portal、Toast、history、cameraを同じbrowser testで実行する。
- [ ] console errorとhydration mismatchが0件であることを確認する。
- [ ] version matrix、結果、採用またはSolid 1.9維持の判断を文書化する。
- [ ] `docs: record Solid 2 compatibility gate`としてcommitする。

### Task 10: Solid 2 RCとstart modeを保留

**Files:**

- Modify: `docs/superpowers/specs/2026-09-11-icon-maker-modernization-design.md`
- Modify: `docs/superpowers/plans/2026-09-11-icon-maker-modernization.md`

**Interfaces:**

- Consumes: Task 9の不合格判定とSolid 1.9 fallback matrix
- Produces: Solid 1.9とSolidStartを維持する判断、Solid 2再判定条件、残作業の更新済み依存関係

- [ ] Task 9の型検査とproduction buildの失敗を確認する。
- [ ] productionを`solid-js@1.9.5`と`@ark-ui/solid@4.10.2`に維持する。
- [ ] SolidStartとVinxiの削除をArk UIのSolid 2対応releaseまで保留する。
- [ ] Solid 2再判定条件と残作業を止めない判断を文書化する。
- [ ] `docs: retain Solid 1 after compatibility gate`としてcommitする。

### Task 11: Vite+、Oxfmt、OxlintとCIへ移行

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `app.config.ts`
- Create: `vite.config.ts` only when Vite+ can own the production build
- Replace: `biome.json` with Oxfmt and Oxlint configuration
- Modify: `.github/workflows/*.yml`
- Modify: `README.md`

**Interfaces:**

- Consumes: Task 9のSolid 1.9維持判断と現行のSolidStart、Vinxi構成
- Produces: Vite+の適合性判定、固定Node version、Oxfmt、Oxlint、共有installを使うCI、previewとproductionを分けたdeploy gate

- [ ] 現行のSolidStartとVinxiに対してVite+ migrationをdry runし、Vite versionとbuild ownershipの互換性を記録する。
- [ ] Vite+が現行buildを実行できる場合だけ`vp check`、test、buildへ移行する。
- [ ] Vite+が不適合でもformatとlintをOxfmtとOxlintへ移し、Biomeを削除する。
- [ ] CIをinstall、check、test、buildの順に整理し、成果物をjob間で再利用する。
- [ ] localとCI相当のcheck、test、buildを実行し、`chore: modernize toolchain on Solid 1`としてcommitする。

### Task 12: Cloudflare Workers適合性を検証

**Files:**

- Create: `src/image/workers-png-encoder.ts`
- Create: `tests/worker/image-contract.test.ts`
- Create: `docs/investigations/cloudflare-workers-deployment.md`
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Task 5の`PngEncoder`とFetch response image handler、Task 10のSolid 1.9維持判断
- Produces: 現行構成に対するCloudflare適合性、Workers用PNG adapter候補、CPU、memory、cold start測定、Cloudflare採用可否

- [ ] Cloudflare Vite pluginと現行のSolidStart、Vinxi構成の互換性を検証する。
- [ ] 互換な場合だけlocal Workers runtimeでSSRを起動する。不適合の場合は理由と代替経路を記録する。
- [ ] Sharp代替adapterで画像route contract testを実行する。
- [ ] PNG寸法、Content-Type、cache、CPU、memory、cold startを測定する。
- [ ] 採用条件ごとの結果とVercel継続を含む判断を文書化する。
- [ ] `docs: evaluate Cloudflare Workers deployment`としてcommitする。

### Task 13: 合格時だけCloudflareへ移行

**Files:**

- Modify: `vite.config.ts`
- Create: `wrangler.jsonc`
- Modify: `.github/workflows/*.yml`
- Modify: `README.md`
- Modify: `vercel.json`

**Interfaces:**

- Consumes: Task 12の合格判断とWorkers PNG adapter
- Produces: Cloudflare previewとproduction deployment、Vercel rollback手順

- [ ] Task 12の全採用条件が合格していることを確認する。
- [ ] preview deploymentを追加して画像route contract testを実行する。
- [ ] security headers、cache、camera Permissions Policyをproduction相当で確認する。
- [ ] production切替とVercel rollbackをREADMEへ記載し、切替前後を検証する。
- [ ] `feat: deploy icon maker to Cloudflare Workers`としてcommitする。

## Dependency Order

1. Task 1を最初に完了する。
2. Task 2とTask 3はTask 1の後に並行実施できる。
3. Task 4の後にTask 5を実施する。
4. Task 6の後にTask 7を実施する。
5. Task 8はTask 4とTask 5の後に実施する。
6. Task 9はTask 3の後に実施する。
7. Task 10はTask 9が不合格の場合に、Solid 1.9 fallbackの確定作業として実施する。
8. Task 11はTask 9の判定後に実施し、Task 10のSolid 1.9維持判断を引き継ぐ。
9. Task 12はTask 5とTask 9の判定後に実施し、Solid 2またはstart modeを前提にしない。
10. Task 13はTask 12が合格した場合だけ実施する。
