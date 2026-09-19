import { hsla, toHex } from "color2k";
import type { Rng } from "~/lib/random";
import type { IconState } from "./icon-state";

/**
 * Identicon: derives an icon deterministically from an arbitrary string.
 *
 * The mapping from seed to icon state is a public contract: the same seed must
 * keep producing the same state for a given version. Everything below is
 * frozen for v1 — do NOT derive these lists from the editor's part options.
 * Changing option lists (including order), color ranges, the hash, the RNG,
 * or the draw order requires a new version.
 */

export const IDENTICON_VERSIONS = ["v1"] as const;
export type IdenticonVersion = (typeof IDENTICON_VERSIONS)[number];

export const MAX_IDENTICON_SEED_LENGTH = 256;

const V1 = {
  hairTypes: ["short", "ponytail", "blunt", "bluntPonytail"],
  eyesTypes: [
    "default",
    "jito",
    "close",
    "small",
    "funky",
    "batsu",
    "guru",
    "hau",
  ],
  eyebrowsTypes: ["default", "komari", "angry"],
  mouthTypes: [
    "default",
    "smile",
    "a",
    "e",
    "i",
    "o",
    "u",
    "gunya",
    "uwa",
    "atsui",
  ],
} as const satisfies {
  hairTypes: readonly IconState["hair"]["type"][];
  eyesTypes: readonly IconState["eyes"]["type"][];
  eyebrowsTypes: readonly IconState["eyebrows"]["type"][];
  mouthTypes: readonly IconState["mouth"]["type"][];
};

type Range = readonly [min: number, max: number];

const pick = <T>(options: readonly T[], rng: Rng): T =>
  options[Math.floor(rng() * options.length)];
const between = ([min, max]: Range, rng: Rng) => rng() * (max - min) + min;
const hsl = (h: Range, s: Range, l: Range, rng: Rng) => {
  const hue = between(h, rng);
  const saturation = between(s, rng);
  const lightness = between(l, rng);
  return toHex(hsla(hue, saturation, lightness, 1));
};

const createIdenticonStateV1 = (rng: Rng): IconState => {
  // Draw order is part of the contract.
  const hairType = pick(V1.hairTypes, rng);
  const hairColor = hsl([0, 360], [0, 1], [0.05, 1], rng);
  const eyesType = pick(V1.eyesTypes, rng);
  const pupilColor = hsl([0, 360], [0, 1], [0, 1], rng);
  const eyebrowsType = pick(V1.eyebrowsTypes, rng);
  const mouthType = pick(V1.mouthTypes, rng);
  // Keep skin tones in a realistic range.
  const skinColor = hsl([0, 25], [0.5, 1], [0.6, 0.9], rng);
  const background = hsl([0, 360], [0.2, 1], [0.2, 0.9], rng);

  return {
    hair: { type: hairType, baseColor: hairColor },
    eyes: { type: eyesType, pupilBaseColor: pupilColor },
    eyebrows: { type: eyebrowsType },
    mouth: { type: mouthType },
    accessories: [],
    head: { type: "default", baseColor: skinColor },
    background,
  };
};

/** sfc32 seeded with 128 bits. */
const sfc32 = (a: number, b: number, c: number, d: number): Rng => {
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
};

export const normalizeIdenticonSeed = (seed: string) => seed.normalize("NFC");

export const isValidIdenticonSeed = (seed: string) =>
  seed.length > 0 && seed.length <= MAX_IDENTICON_SEED_LENGTH;

/** SHA-256 of the NFC-normalized UTF-8 seed, fed into sfc32. */
export const createSeededRng = async (seed: string): Promise<Rng> => {
  const bytes = new TextEncoder().encode(normalizeIdenticonSeed(seed));
  const digest = new DataView(await crypto.subtle.digest("SHA-256", bytes));
  const rng = sfc32(
    digest.getUint32(0),
    digest.getUint32(4),
    digest.getUint32(8),
    digest.getUint32(12),
  );
  // Discard initial outputs to mix the state.
  for (let i = 0; i < 12; i++) rng();
  return rng;
};

export const identiconPath = (
  seed: string,
  format: "png" | "svg",
  version: IdenticonVersion = "v1",
) => `/identicon/${version}/${encodeURIComponent(seed)}.${format}`;

export const createIdenticonState = async (
  seed: string,
  version: IdenticonVersion = "v1",
): Promise<IconState> => {
  const rng = await createSeededRng(seed);
  switch (version) {
    case "v1":
      return createIdenticonStateV1(rng);
  }
};
