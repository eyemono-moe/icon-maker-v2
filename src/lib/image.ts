import { sharpPngEncoder } from "../image/sharp-png-encoder";
import type { ImageQueryOutput } from "./imageQuerySchema";

export const convertFromSvg = async (
  svg: string,
  format: ImageQueryOutput["f"],
  options?: {
    size?: ImageQueryOutput["s"];
    square?: boolean;
  },
) => {
  switch (format) {
    case "png": {
      const w = options?.size?.w ?? 400;
      const h = options?.size?.h ?? w;
      return sharpPngEncoder.encode(svg, { w, h, square: options?.square });
    }
    default:
      return svg;
  }
};
