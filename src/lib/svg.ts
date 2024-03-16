import { optimize } from "svgo";

export const optimizeSvg = (svgText: string) =>
  optimize(svgText, {
    plugins: [
      "removeEmptyContainers",
      "removeComments",
      "removeUselessDefs",
      "collapseGroups",
      "cleanupNumericValues",
      {
        name: "removeUnknownsAndDefaults",
        params: {
          keepDataAttrs: false,
        },
      },
      {
        name: "removeComments",
        params: {
          preservePatterns: false,
        },
      },
    ],
  }).data;
