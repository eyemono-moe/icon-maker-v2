# Solid 2 RCとArk UIの最小reproduction

このreproductionは、Solid 2 RCのWeb runtimeと現在のArk UIを組み合わせたときの型検査およびproduction buildの失敗を再現する。

`package.json`と`pnpm-lock.yaml`には、互換性gateで検証したSolid、Web runtime、Router、Meta、Ark UIのversion matrixを固定している。

互換性gate全体は、ネストしたlockfileからinstallし、Router/Meta単体の成功とArk UIの期待された失敗を検証する次のコマンドで再実行できる。

```sh
pnpm verify
```

個別に確認する場合は`pnpm type`と`pnpm build`を実行できるが、これらはArk UI reproductionの期待された失敗である。

`src-router-meta.tsx`はRouter 2とMeta 1だけを組み合わせた独立したSolid 2型検査probeであり、Ark UIの失敗とは分離している。

`pnpm type`は、Ark UIがSolid 2で削除された`solid-js`の`JSX` exportを参照するため失敗する。

`pnpm build`は、Ark UIとその依存packageがSolid 2で削除された`solid-js/web` subpathをimportするため失敗する。

再現対象をArk UIのMenu、Portal、Toastに限定し、アプリケーション固有のcodeとSolidStartを含めていない。
