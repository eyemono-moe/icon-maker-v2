import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";
import unoCss from "unocss/vite";

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

export default defineConfig({
  middleware: "./src/middleware.ts",
  server: {
    preset: "vercel",
    hooks: {
      compiled(nitro) {
        copySharpRuntimePackages(nitro.options.output.serverDir);
      },
    },
  },
  vite: { plugins: [unoCss(), visualizer()] },
});
