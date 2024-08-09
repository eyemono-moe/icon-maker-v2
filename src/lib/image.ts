import sharp from "sharp";
import type { ImageQueryOutput } from "~/routes/image";

export const convertFromSvg = async (
  svg: string,
  format: ImageQueryOutput["f"],
  size?: ImageQueryOutput["s"],
) => {
  const w = size?.w ?? 400;
  const h = size?.h ?? w;

  const min = Math.min(w, h);

  switch (format) {
    case "png": {
      return await sharp(Buffer.from(svg))
        .resize(min, min)
        .extend({
          top: (h - min) / 2,
          bottom: (h - min) / 2,
          left: (w - min) / 2,
          right: (w - min) / 2,
          extendWith: "copy",
        })
        .png()
        .toBuffer();
    }
    default:
      return svg;
  }
};
