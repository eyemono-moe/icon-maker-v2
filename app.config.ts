import { defineConfig } from "@solidjs/start/config";
import unoCss from "unocss/vite";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    plugins: [unoCss()],
  },
});
