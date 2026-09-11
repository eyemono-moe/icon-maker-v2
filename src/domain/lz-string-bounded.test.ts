import lzString from "lz-string";
import { describe, expect, test } from "vitest";
import { decompressUriComponentBounded } from "./lz-string-bounded";

describe("bounded LZ-string decompression", () => {
  test("decodes an existing URI-component payload", () => {
    const input = lzString.compressToEncodedURIComponent("legacy state");

    expect(decompressUriComponentBounded(input, 64)).toEqual({
      ok: true,
      value: "legacy state",
    });
  });

  test("stops before appending output beyond the configured limit", () => {
    const input = lzString.compressToEncodedURIComponent("a".repeat(2_000_000));

    const result = decompressUriComponentBounded(input, 1_024);

    expect(result).toMatchObject({
      ok: false,
      reason: "output-too-large",
    });
    if (!result.ok && result.reason === "output-too-large") {
      expect(result.outputLength).toBeLessThanOrEqual(1_024);
    }
  });

  test("rejects characters outside the URI-safe alphabet", () => {
    expect(decompressUriComponentBounded("%%%", 64)).toEqual({
      ok: false,
      reason: "invalid-input",
    });
  });
});
