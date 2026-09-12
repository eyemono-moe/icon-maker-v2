import { describe, expect, test } from "vitest";
import type { PngEncoder } from "./png-encoder";

describe("PngEncoder", () => {
  test("defines an async SVG-to-PNG seam with dimensions", async () => {
    const encoder: PngEncoder = {
      encode: async (_svg, dimensions) =>
        Uint8Array.from([dimensions.w, dimensions.h]),
    };

    await expect(encoder.encode("<svg />", { w: 10, h: 20 })).resolves.toEqual(
      Uint8Array.from([10, 20]),
    );
  });
});
