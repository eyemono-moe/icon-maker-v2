import { describe, expect, test } from "vitest";
import { createIdenticonState } from "../domain/identicon";
import {
  createIdenticonResponse,
  parseIdenticonPath,
} from "./identicon-response";

const encoder = {
  encode: async (_svg: string, dimensions: { w: number; h: number }) =>
    new Uint8Array([dimensions.w % 256, dimensions.h % 256]),
};

const get = (path: string) =>
  createIdenticonResponse(new Request(`http://localhost${path}`), encoder);

describe("parseIdenticonPath", () => {
  test.each([
    ["/identicon/v1/alice", "alice", "svg"],
    ["/identicon/v1/alice.svg", "alice", "svg"],
    ["/identicon/v1/alice.png", "alice", "png"],
    ["/identicon/v1/foo.bar", "foo.bar", "svg"],
    ["/identicon/v1/foo.bar.png", "foo.bar", "png"],
    ["/identicon/v1/user@example.com.png", "user@example.com", "png"],
    ["/identicon/v1/a%2Fb%20c.png", "a/b c", "png"],
  ])("parses %s", (pathname, seed, format) => {
    expect(parseIdenticonPath(pathname)).toEqual({
      ok: true,
      version: "v1",
      seed,
      format,
    });
  });

  test.each([
    ["/identicon/v2/alice", 404],
    ["/identicon/v1", 404],
    ["/identicon/v1/.png", 400],
    ["/identicon/v1/%E0%A4%A", 400],
    [`/identicon/v1/${"a".repeat(257)}`, 400],
  ])("rejects %s", (pathname, status) => {
    expect(parseIdenticonPath(pathname)).toEqual({ ok: false, status });
  });
});

describe("createIdenticonResponse", () => {
  test("renders the seeded state as SVG", async () => {
    const response = await get("/identicon/v1/user@example.com.svg");
    const state = await createIdenticonState("user@example.com");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=31536000",
    );
    const svg = await response.text();
    expect(svg.toLowerCase()).toContain(state.background.toLowerCase());
  });

  test("passes requested size to the PNG encoder", async () => {
    const response = await get("/identicon/v1/alice.png?s=120");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(await response.arrayBuffer()).toEqual(
      Uint8Array.from([120, 120]).buffer,
    );
  });

  test.each(["s=0", "s=2000", "s=10&s=20"])(
    "rejects invalid size query: %s",
    async (query) => {
      expect((await get(`/identicon/v1/alice.png?${query}`)).status).toBe(400);
    },
  );

  test("returns 404 for unknown versions", async () => {
    expect((await get("/identicon/v9/alice.png")).status).toBe(404);
  });
});
