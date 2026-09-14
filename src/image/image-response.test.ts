import { describe, expect, test } from "vitest";
import { createDefaultIconState } from "../domain/icon-state";
import { encodeIconState } from "../domain/icon-state-codec";
import { createImageResponse } from "./image-response";
import { sharpPngEncoder } from "./sharp-png-encoder";

const encoder = {
  encode: async (_svg: string, dimensions: { w: number; h: number }) =>
    new Uint8Array([dimensions.w, dimensions.h]),
};

describe("createImageResponse", () => {
  test.each(["f=invalid&f=svg", "p=invalid&p=", "s=invalid&s=120"])(
    "rejects repeated query parameter: %s",
    async (query) => {
      const response = await createImageResponse(
        new Request(`http://localhost/image?${query}`),
        encoder,
      );

      expect(response.status).toBe(400);
    },
  );

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

  test("renders an encoded non-default state color in SVG and PNG output", async () => {
    const state = createDefaultIconState();
    state.hair.type = "ponytail";
    state.hair.baseColor = "#123456";
    state.eyes.type = "jito";
    state.eyes.pupilBaseColor = "#654321";
    state.background = "#abcdef";
    const encoded = encodeIconState(state);

    const defaultSvg = await createImageResponse(
      new Request("http://localhost/image?f=svg"),
      sharpPngEncoder,
    );
    const customSvg = await createImageResponse(
      new Request(`http://localhost/image?f=svg&p=${encoded}`),
      sharpPngEncoder,
    );
    const defaultPng = await createImageResponse(
      new Request("http://localhost/image?f=png"),
      sharpPngEncoder,
    );
    const customPng = await createImageResponse(
      new Request(`http://localhost/image?f=png&p=${encoded}`),
      sharpPngEncoder,
    );

    const defaultSvgText = await defaultSvg.text();
    const customSvgText = await customSvg.text();
    expect(customSvgText).toContain("#123456");
    expect(customSvgText).toContain("#654321");
    expect(customSvgText).toContain("#abcdef");
    expect(customSvgText).not.toBe(defaultSvgText);
    expect(Buffer.from(await customPng.arrayBuffer())).not.toEqual(
      Buffer.from(await defaultPng.arrayBuffer()),
    );
  });
});
