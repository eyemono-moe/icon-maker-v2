import sharp from "sharp";
import type { ImageQuery } from "~/routes/image";

export const convertFromSvg = async (svg: string, format: ImageQuery["f"]) => {
  switch (format) {
    case "png": {
      return await sharp(Buffer.from(svg)).png().toBuffer();
    }
    default:
      return svg;
  }
};
