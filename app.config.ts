import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";
import unoCss from "unocss/vite";

export default defineConfig({
  middleware: "./src/middleware.ts",
  server: {
    preset: "vercel",
  },
  vite: { plugins: [unoCss(), visualizer()] },
});
