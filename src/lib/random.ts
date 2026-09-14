import { hsla, toHex } from "color2k";

/** Returns a number in [0, 1). Pass a seeded generator for reproducible results. */
export type Rng = () => number;

export const choice = <T>(arr: readonly T[], rng: Rng = Math.random): T =>
  arr[Math.floor(rng() * arr.length)];
export const range = (min: number, max: number, rng: Rng = Math.random) =>
  rng() * (max - min) + min;
export const randomHSL = (
  h: number | [number, number],
  s: number | [number, number],
  l: number | [number, number],
  rng: Rng = Math.random,
) => {
  const _h = Array.isArray(h) ? range(h[0], h[1], rng) : h;
  const _s = Array.isArray(s) ? range(s[0], s[1], rng) : s;
  const _l = Array.isArray(l) ? range(l[0], l[1], rng) : l;
  return toHex(hsla(_h, _s, _l, 1));
};
