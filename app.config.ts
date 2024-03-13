import { defineConfig } from "@solidjs/start/config";
import unoCss from "unocss/vite";

export default defineConfig({
  vite: {
    plugins: [unoCss()],
  },
});
