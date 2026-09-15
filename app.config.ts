import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";
import unoCss from "unocss/vite";

const serverPreset = process.env.SERVER_PRESET ?? "vercel";
const isCloudflare = serverPreset.startsWith("cloudflare");

// sharp >= 0.34 loads its native binary through `createRequire` inside ESM,
// which nitro's file tracer cannot follow. Without the platform packages, the
// Vercel function fails at runtime with
// `Could not load the "sharp" module using the linux-x64 runtime`.
// Vercel functions run on linux-x64 (glibc), so copy those packages explicitly.
const SHARP_RUNTIME_PACKAGES = [
  "@img/sharp-linux-x64",
  "@img/sharp-libvips-linux-x64",
];

const copySharpRuntimePackages = (serverDir: string) => {
  let require = createRequire(createRequire(import.meta.url).resolve("sharp"));
  for (const pkg of SHARP_RUNTIME_PACKAGES) {
    const pkgDir = dirname(require.resolve(`${pkg}/package`));
    cpSync(pkgDir, join(serverDir, "node_modules", pkg), {
      recursive: true,
      dereference: true,
    });
    // The libvips package is a dependency of the binding package, not of sharp.
    require = createRequire(join(pkgDir, "package.json"));
  }
};

// Workers cannot load sharp, so swap in the resvg-wasm encoder. The wasm import
// stays external in the Vite build and is bundled by Nitro's wasm support.
const runtimePngEncoderPath = fileURLToPath(
  new URL("./src/image/runtime-png-encoder.ts", import.meta.url),
);
const workersPngEncoderPath = fileURLToPath(
  new URL("./src/image/runtime-png-encoder.workers.ts", import.meta.url),
);

// vite is not a direct dependency, so borrow its Plugin type from UnoCSS.
type VitePlugin = ReturnType<typeof unoCss>[number];

const cloudflareRuntime = (): VitePlugin => ({
  name: "icon-maker:cloudflare-runtime",
  enforce: "pre",
  async resolveId(source, importer, options) {
    if (source.endsWith(".wasm?module")) return { id: source, external: true };
    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    });
    if (resolved?.id === runtimePngEncoderPath) return workersPngEncoderPath;
    return resolved;
  },
});

export default defineConfig({
  middleware: "./src/middleware.ts",
  server: {
    preset: serverPreset,
    ...(isCloudflare
      ? {
          experimental: { wasm: true },
          // SolidStart keeps request context in AsyncLocalStorage. Nitro's unenv
          // stub for it has no store, so use workerd's nodejs_compat module.
          rollupConfig: { external: ["node:async_hooks"] },
        }
      : {
          // Register via a module: `hooks.compiled` in config would replace the
          // vercel preset's own `compiled` hook, which writes `.vercel/output/config.json`.
          modules: [
            (nitro) => {
              nitro.hooks.hook("compiled", () => {
                copySharpRuntimePackages(nitro.options.output.serverDir);
              });
            },
          ],
        }),
  },
  vite: {
    plugins: [
      unoCss(),
      visualizer(),
      ...(isCloudflare ? [cloudflareRuntime()] : []),
    ],
  },
});
