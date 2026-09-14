import * as v from "valibot";
import { describe, expect, test } from "vitest";
import type { Rng } from "~/lib/random";
import { createRandomIconState, randomFieldValue } from "./icon-randomizer";
import { iconStateSchema } from "./icon-state";

// mulberry32
const seededRng = (seed: number): Rng => {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

describe("icon randomizer", () => {
  test("creates schema-valid states", () => {
    const rng = seededRng(1);
    for (let i = 0; i < 100; i++) {
      expect(v.is(iconStateSchema, createRandomIconState(rng))).toBe(true);
    }
  });

  test("is deterministic for the same rng seed", () => {
    expect(createRandomIconState(seededRng(42))).toEqual(
      createRandomIconState(seededRng(42)),
    );
  });

  test("changes a part type from the current value when possible", () => {
    const rng = seededRng(7);
    for (let i = 0; i < 50; i++) {
      expect(randomFieldValue("hair", "type", "short", rng)).not.toBe("short");
    }
  });

  test("keeps a single-option part type", () => {
    expect(randomFieldValue("head", "type", "default")).toBe("default");
  });

  test("generates valid colors for optional fields", () => {
    const value = randomFieldValue("eyes", "eyeWhiteColor", undefined);
    expect(
      v.is(iconStateSchema.entries.eyes.entries.eyeWhiteColor, value),
    ).toBe(true);
  });
});
