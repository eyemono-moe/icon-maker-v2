import sharp from "sharp";
import type { PngDimensions, PngEncoder } from "./png-encoder";

export class SharpPngEncoder implements PngEncoder {
  async encode(svg: string, dimensions: PngDimensions): Promise<Uint8Array> {
    const image = sharp(Buffer.from(svg));

    if (dimensions.square) {
      const min = Math.min(dimensions.w, dimensions.h);
      image.resize(min, min).extend({
        top: Math.floor((dimensions.h - min) / 2),
        bottom: Math.ceil((dimensions.h - min) / 2),
        left: Math.floor((dimensions.w - min) / 2),
        right: Math.ceil((dimensions.w - min) / 2),
        extendWith: "copy",
      });
    } else {
      image.resize(dimensions.w, dimensions.h);
    }

    return image.png().toBuffer();
  }
}

export const sharpPngEncoder = new SharpPngEncoder();
