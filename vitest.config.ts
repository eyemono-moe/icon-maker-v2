import { fileURLToPath } from "node:url";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid({ ssr: true, solid: { generate: "ssr" } })],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "solid-js/web": fileURLToPath(
        new URL("./node_modules/solid-js/web/dist/server.js", import.meta.url),
      ),
    },
  },
  test: {
    include: [
      "src/**/*.test.{ts,tsx}",
      "scripts/**/*.test.mjs",
      "tests/worker/**/*.test.ts",
    ],
  },
});
