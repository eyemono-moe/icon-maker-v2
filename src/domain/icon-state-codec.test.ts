import lzString from "lz-string";
import { describe, expect, test } from "vitest";
import { type IconState, createDefaultIconState } from "./icon-state";
import {
  MAX_ENCODED_ICON_STATE_LENGTH,
  MAX_ICON_STATE_JSON_LENGTH,
  decodeIconState,
  encodeIconState,
} from "./icon-state-codec";

const representativeState: IconState = {
  hair: {
    type: "ponytail",
    baseColor: "#123456",
    strokeColor: "#223344",
  },
  eyes: {
    type: "jito",
    pupilBaseColor: "#654321",
    eyeWhiteColor: "#ffffff",
  },
  eyebrows: { type: "angry" },
  mouth: { type: "smile", insideColor: "#dd4466" },
  accessories: [],
  head: { type: "default", baseColor: "#fedcba" },
  background: "#abcdef",
};

describe("icon state codec", () => {
  test("returns independent default states", () => {
    const first = createDefaultIconState();
    const second = createDefaultIconState();

    first.hair.baseColor = "#000000";

    expect(second.hair.baseColor).toBe("#9940BB");
  });

  test("round trips a valid icon state", () => {
    const decoded = decodeIconState(encodeIconState(representativeState));

    expect(decoded).toEqual({ ok: true, value: representativeState });
  });

  test("keeps legacy URLs compatible while discarding obsolete transform fields", () => {
    const legacyParam =
      "N4IgFghglgTiBcoBGEDOBTAwgewDbbnhAGIBOUgFgAYAhGkAGhABcBPAB3QRFTAOZABfJulbpUCUOwCu7KLhposeAt2IBRdQCYtANl2MQ2TgDsEARibtsqKMyjYziEAA8EVJq3fCWHLkQATdAAzCGlcAR8IAGNo8VQCKHEEAG0AXSYUaIBrAHMYbGkTALU6TX1DUXQkAoB3CWc2Tm4g0PDIpjB0CBLGvxaQsIjDa1t7R0lXd09vJgLmCHGnDxAUDBx8QhIAMW3MfcwhJgBbQuYwSab-EFahgSZjdGXBQSA";

    expect(decodeIconState(legacyParam)).toEqual({
      ok: true,
      value: createDefaultIconState(),
    });
  });

  test("rejects a state with an unknown part type", () => {
    const encoded = lzString.compressToEncodedURIComponent(
      JSON.stringify({
        ...representativeState,
        hair: { ...representativeState.hair, type: "unsupported" },
      }),
    );

    expect(decodeIconState(encoded)).toMatchObject({
      ok: false,
      error: { code: "invalid-schema" },
    });
  });

  test("rejects a color that is not a valid CSS hex length", () => {
    const encoded = lzString.compressToEncodedURIComponent(
      JSON.stringify({
        ...representativeState,
        background: "#12345",
      }),
    );

    expect(decodeIconState(encoded)).toMatchObject({
      ok: false,
      error: { code: "invalid-schema" },
    });
  });

  test("rejects an encoded input before decompression when it is too large", () => {
    expect(
      decodeIconState("x".repeat(MAX_ENCODED_ICON_STATE_LENGTH + 1)),
    ).toEqual({
      ok: false,
      error: {
        code: "input-too-large",
        limit: MAX_ENCODED_ICON_STATE_LENGTH,
      },
    });
  });

  test("rejects decompressed JSON that exceeds the output limit", () => {
    const encoded = lzString.compressToEncodedURIComponent(
      JSON.stringify({
        ...representativeState,
        background: `#${"a".repeat(MAX_ICON_STATE_JSON_LENGTH)}`,
      }),
    );

    expect(decodeIconState(encoded)).toEqual({
      ok: false,
      error: {
        code: "output-too-large",
        limit: MAX_ICON_STATE_JSON_LENGTH,
      },
    });
  });

  test("returns a typed error for malformed compressed input", () => {
    expect(decodeIconState("%%%not-compressed%%%")).toMatchObject({
      ok: false,
      error: { code: "invalid-json" },
    });
  });
});
