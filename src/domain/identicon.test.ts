import { parseToHsla } from "color2k";
import * as v from "valibot";
import { describe, expect, test } from "vitest";
import { iconStateSchema } from "./icon-state";
import {
  MAX_IDENTICON_SEED_LENGTH,
  createIdenticonState,
  identiconPath,
  isValidIdenticonSeed,
} from "./identicon";

describe("identicon", () => {
  // The v1 mapping is a public contract. If this snapshot changes, bump the version instead.
  test("keeps v1 output stable", async () => {
    expect(await createIdenticonState("user@example.com", "v1"))
      .toMatchInlineSnapshot(`
        {
          "accessories": [],
          "background": "#fac5c2",
          "eyebrows": {
            "type": "komari",
          },
          "eyes": {
            "pupilBaseColor": "#0e533f",
            "type": "jito",
          },
          "hair": {
            "baseColor": "#793516",
            "type": "blunt",
          },
          "head": {
            "baseColor": "#eb7e70",
            "type": "default",
          },
          "mouth": {
            "type": "i",
          },
        }
      `);
    expect(await createIdenticonState("eyemono", "v1")).toMatchInlineSnapshot(`
      {
        "accessories": [],
        "background": "#b4cfb0",
        "eyebrows": {
          "type": "default",
        },
        "eyes": {
          "pupilBaseColor": "#7d0d79",
          "type": "default",
        },
        "hair": {
          "baseColor": "#724e40",
          "type": "blunt",
        },
        "head": {
          "baseColor": "#f3ccc8",
          "type": "default",
        },
        "mouth": {
          "type": "e",
        },
      }
    `);
  });

  test("is deterministic and seed-sensitive", async () => {
    expect(await createIdenticonState("alice")).toEqual(
      await createIdenticonState("alice"),
    );
    expect(await createIdenticonState("alice")).not.toEqual(
      await createIdenticonState("bob"),
    );
  });

  test("treats NFC-equivalent seeds as the same", async () => {
    expect(await createIdenticonState("caf\u00e9")).toEqual(
      await createIdenticonState("cafe\u0301"),
    );
  });

  test("creates schema-valid states with realistic skin tones", async () => {
    for (let i = 0; i < 200; i++) {
      const state = await createIdenticonState(`seed-${i}`);
      expect(v.is(iconStateSchema, state)).toBe(true);
      const [h, s, l] = parseToHsla(state.head.baseColor);
      expect(h).toBeLessThanOrEqual(25.5);
      expect(s).toBeGreaterThanOrEqual(0.49);
      expect(l).toBeGreaterThanOrEqual(0.59);
      expect(l).toBeLessThanOrEqual(0.91);
    }
  });

  test("validates seed length", () => {
    expect(isValidIdenticonSeed("")).toBe(false);
    expect(isValidIdenticonSeed("a".repeat(MAX_IDENTICON_SEED_LENGTH))).toBe(
      true,
    );
    expect(
      isValidIdenticonSeed("a".repeat(MAX_IDENTICON_SEED_LENGTH + 1)),
    ).toBe(false);
  });

  test("builds encoded API paths", () => {
    expect(identiconPath("a b/c@example.com", "png")).toBe(
      "/identicon/v1/a%20b%2Fc%40example.com.png",
    );
  });
});
