import { describe, expect, test } from "vitest";
import { createImageResponse } from "./image-response";

const encoder = {
  encode: async (_svg: string, dimensions: { w: number; h: number }) =>
    new Uint8Array([dimensions.w, dimensions.h]),
};

describe("createImageResponse", () => {
  test("returns SVG with the existing image response contract", async () => {
    const response = await createImageResponse(
      new Request("http://localhost/image?f=svg"),
      encoder,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=31536000",
    );
    expect(await response.text()).toContain("<svg");
  });

  test("passes requested dimensions to the PNG encoder", async () => {
    const response = await createImageResponse(
      new Request("http://localhost/image?f=png&s=120x240"),
      encoder,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(await response.arrayBuffer()).toEqual(
      Uint8Array.from([120, 240]).buffer,
    );
  });

  test("uses OGP dimensions and PNG output for the OGP route", async () => {
    const response = await createImageResponse(
      new Request("http://localhost/ogp"),
      encoder,
    );

    expect(response.status).toBe(200);
    expect(await response.arrayBuffer()).toEqual(
      Uint8Array.from([1000 % 256, 525]).buffer,
    );
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  test("rejects malformed icon state without invoking the encoder", async () => {
    let called = false;
    const response = await createImageResponse(
      new Request("http://localhost/image?f=png&p=invalid"),
      {
        encode: async () => {
          called = true;
          return new Uint8Array();
        },
      },
    );

    expect(response.status).toBe(400);
    expect(called).toBe(false);
  });
});
