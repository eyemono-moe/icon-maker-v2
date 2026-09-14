import { describe, expect, test } from "vitest";
import { SharpPngEncoder } from "./sharp-png-encoder";

const encoder = new SharpPngEncoder();
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="red" /></svg>';

describe("SharpPngEncoder", () => {
  test("returns a PNG with the exact requested dimensions when square padding has an odd remainder", async () => {
    const png = await encoder.encode(svg, { w: 121, h: 240, square: true });
    const bytes = Buffer.from(png);

    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(bytes.readUInt32BE(16)).toBe(121);
    expect(bytes.readUInt32BE(20)).toBe(240);
  });
});
