# Solid 2 RCとArk UIの最小reproduction

このreproductionは、Solid 2 RCのWeb runtimeと現在のArk UIを組み合わせたときの型検査およびproduction buildの失敗を再現する。

`package.json`と`pnpm-lock.yaml`には、互換性gateで検証したSolid、Web runtime、Router、Meta、Ark UIのversion matrixを固定している。

次のコマンドを実行する。

```sh
pnpm install --ignore-workspace
pnpm type
pnpm build
```

`pnpm type`は、Ark UIがSolid 2で削除された`solid-js`の`JSX` exportを参照するため失敗する。

`pnpm build`は、Ark UIとその依存packageがSolid 2で削除された`solid-js/web` subpathをimportするため失敗する。

再現対象をArk UIのMenu、Portal、Toastに限定し、アプリケーション固有のcodeとSolidStartを含めていない。
