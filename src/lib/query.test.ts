import * as v from "valibot";
import { describe, expect, test } from "vitest";
import { imageQuerySchema } from "./imageQuerySchema";

describe("image query", () => {
  test("defaults the image format to SVG", () => {
    const result = v.safeParse(imageQuerySchema, {});

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ f: "svg" });
  });

  test("parses rectangular image dimensions", () => {
    const result = v.safeParse(imageQuerySchema, {
      f: "png",
      s: "256x128",
    });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ f: "png", s: { w: 256, h: 128 } });
  });

  test.each(["0", "0x128", "256x0", "1025", "256px"])(
    "rejects an unsafe image size: %s",
    (size) => {
      const result = v.safeParse(imageQuerySchema, { s: size });

      expect(result.success).toBe(false);
    },
  );
});
