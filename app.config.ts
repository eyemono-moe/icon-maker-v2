import { defineConfig } from "@solidjs/start/config";
import { visualizer } from "rollup-plugin-visualizer";
import unoCss from "unocss/vite";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    plugins: [unoCss(), visualizer()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("css-tree")) return "css-tree";
            if (id.includes("svgo")) return "svgo";
          },
        },
      },
    },
  },
});
