/// <reference types="@solidjs/start/env" />

declare module "*.wasm?module" {
  const module: WebAssembly.Module;
  export default module;
}

declare namespace App {
  interface RequestEventLocals {
    cspNonce: string;
  }
}
