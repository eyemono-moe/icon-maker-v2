import { optimize } from "svgo";

export const optimizeSvg = (svgText: string) =>
  optimize(svgText, {
    plugins: ["removeComments", "removeUselessDefs"],
  }).data;
