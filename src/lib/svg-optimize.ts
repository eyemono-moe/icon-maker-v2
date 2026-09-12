import { optimize } from "svgo";

export const optimizeSvg = (svgText: string) =>
  optimize(svgText, {
    plugins: [
      "cleanupIds",
      "removeEmptyContainers",
      "removeComments",
      "removeUselessDefs",
      "collapseGroups",
      "cleanupNumericValues", // cleanUpIdsより前に置くと、idが数字だった時に`0123`->`123`のように変換されてreferenceが壊れる
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
