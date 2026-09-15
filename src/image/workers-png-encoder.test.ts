import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { renderIconSvg } from "./render-svg";
import { sharpPngEncoder } from "./sharp-png-encoder";
import { WorkersPngEncoder } from "./workers-png-encoder";

const require = createRequire(import.meta.url);
const encoder = new WorkersPngEncoder(() =>
  readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm")),
);

const decode = async (png: Uint8Array) => {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};

const meanAbsoluteDifference = (a: Uint8Array, b: Uint8Array) => {
  let total = 0;
  for (let i = 0; i < a.length; i++) total += Math.abs(a[i] - b[i]);
  return total / a.length;
};

const redSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="red" /></svg>';

describe("WorkersPngEncoder", () => {
  test("returns a PNG with the exact requested dimensions when square padding has an odd remainder", async () => {
    const png = await encoder.encode(redSvg, { w: 121, h: 240, square: true });
    const bytes = Buffer.from(png);

    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(bytes.readUInt32BE(16)).toBe(121);
    expect(bytes.readUInt32BE(20)).toBe(240);
  });

  test("fills square padding by copying edge pixels", async () => {
    const png = await encoder.encode(redSvg, { w: 30, h: 10, square: true });
    const { data, width, height } = await decode(png);

    expect([width, height]).toEqual([30, 10]);
    for (let i = 0; i < data.length; i += 4) {
      expect([...data.subarray(i, i + 4)]).toEqual([255, 0, 0, 255]);
    }
  });

  test.each([
    {
      name: "icon",
      options: undefined,
      dimensions: { w: 400, h: 400, square: true },
    },
    {
      name: "padded icon",
      options: undefined,
      dimensions: { w: 300, h: 200, square: true },
    },
    {
      name: "ogp",
      options: { variant: "ogp" as const },
      dimensions: { w: 1000, h: 525 },
    },
  ])(
    "renders the $name close to the Sharp adapter",
    async ({ options, dimensions }) => {
      const svg = await renderIconSvg(undefined, options);
      const [actual, expected] = await Promise.all([
        encoder.encode(svg, dimensions).then(decode),
        sharpPngEncoder.encode(svg, dimensions).then(decode),
      ]);

      expect([actual.width, actual.height]).toEqual([
        expected.width,
        expected.height,
      ]);
      expect(meanAbsoluteDifference(actual.data, expected.data)).toBeLessThan(
        2,
      );
    },
  );
});
