import { WorkersPngEncoder } from "./workers-png-encoder";

export const runtimePngEncoder = new WorkersPngEncoder(() =>
  import("@resvg/resvg-wasm/index_bg.wasm?module").then((mod) => mod.default),
);
