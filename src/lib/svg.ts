import { optimize } from "svgo";

export const optimizeSvg = (svgText: string) =>
  optimize(svgText, {
    plugins: [
      "removeComments",
      "removeUselessDefs",
      {
        name: "removeUnknownsAndDefaults",
        params: {
          keepDataAttrs: false,
        },
      },
    ],
  }).data;
