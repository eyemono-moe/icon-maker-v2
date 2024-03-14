import transformerVariantGroup from "@unocss/transformer-variant-group";
import { defineConfig, presetIcons, presetTypography, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetIcons(), presetTypography()],
  transformers: [transformerVariantGroup()],
});
