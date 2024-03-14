import transformerVariantGroup from "@unocss/transformer-variant-group";
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Noto Sans JP:400,700",
      },
    }),
  ],
  transformers: [transformerVariantGroup()],
});
