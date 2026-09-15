import { describe, expect, test } from "vitest";
import { createDefaultIconState } from "../../src/domain/icon-state";
import { encodeIconState } from "../../src/domain/icon-state-codec";

// Contract test for a running server (wrangler dev, Vercel preview, etc.). Example:
// IMAGE_CONTRACT_BASE_URL=http://127.0.0.1:8787 pnpm test:contract
const baseUrl = process.env.IMAGE_CONTRACT_BASE_URL;

const fetchPath = (path: string) => fetch(new URL(path, baseUrl));

const pngSize = async (response: Response) => {
  const bytes = new Uint8Array(await response.arrayBuffer());
  const view = new DataView(bytes.buffer);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  return { w: view.getUint32(16), h: view.getUint32(20) };
};

const expectCachedImage = (response: Response, contentType: string) => {
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe(contentType);
  expect(response.headers.get("cache-control")).toBe(
    "public, max-age=31536000",
  );
};

describe.skipIf(!baseUrl)("image route contract", () => {
  test.each(["/image?f=svg", "/image.svg", "/image"])(
    "returns SVG from %s",
    async (path) => {
      const response = await fetchPath(path);
      expectCachedImage(response, "image/svg+xml");
      expect(await response.text()).toContain("<svg");
    },
  );

  test.each([
    { path: "/image?f=png", size: { w: 400, h: 400 } },
    { path: "/image.png", size: { w: 400, h: 400 } },
    { path: "/image?f=png&s=120", size: { w: 120, h: 120 } },
    { path: "/image?f=png&s=121x240", size: { w: 121, h: 240 } },
    { path: "/ogp", size: { w: 1000, h: 525 } },
  ])("returns a $size.w x $size.h PNG from $path", async ({ path, size }) => {
    const response = await fetchPath(path);
    expectCachedImage(response, "image/png");
    expect(await pngSize(response)).toEqual(size);
  });

  test("renders an encoded icon state", async () => {
    const p = encodeURIComponent(encodeIconState(createDefaultIconState()));
    const response = await fetchPath(`/image.png?p=${p}&s=64`);
    expectCachedImage(response, "image/png");
    expect(await pngSize(response)).toEqual({ w: 64, h: 64 });
  });

  test.each(["/image?f=png&f=svg", "/image?p=invalid", "/image?s=2048"])(
    "rejects %s",
    async (path) => {
      expect((await fetchPath(path)).status).toBe(400);
    },
  );

  test("serves the editor with security headers", async () => {
    const response = await fetchPath("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toMatch(
      /script-src 'self' 'nonce-[0-9a-f]+'/,
    );
    expect(response.headers.get("permissions-policy")).toBe("camera=(self)");
  });
});
