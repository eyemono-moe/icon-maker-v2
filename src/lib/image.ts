import sharp from "sharp";
import type { ImageQueryOutput } from "~/routes/image";

export const convertFromSvg = async (
  svg: string,
  format: ImageQueryOutput["f"],
  options?: {
    size?: ImageQueryOutput["s"];
    square?: boolean;
  },
) => {
  const image = sharp(Buffer.from(svg));

  if (options?.square) {
    const w = options?.size?.w ?? 400;
    const h = options?.size?.h ?? w;
    const min = Math.min(w, h);
    image.resize(min, min).extend({
      top: Math.floor((h - min) / 2),
      bottom: Math.floor((h - min) / 2),
      left: Math.floor((w - min) / 2),
      right: Math.floor((w - min) / 2),
      extendWith: "copy",
    });
  } else {
    if (options?.size) {
      image.resize(options?.size?.w, options?.size?.h);
    }
  }

  switch (format) {
    case "png": {
      return await image.png().toBuffer();
    }
    default:
      return svg;
  }
};
