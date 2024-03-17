import { hsla, toHex } from "color2k";

export const choice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
export const range = (min: number, max: number) =>
  Math.random() * (max - min) + min;
export const randomHSL = (
  h: number | [number, number],
  s: number | [number, number],
  l: number | [number, number],
) => {
  const _h = Array.isArray(h) ? range(h[0], h[1]) : h;
  const _s = Array.isArray(s) ? range(s[0], s[1]) : s;
  const _l = Array.isArray(l) ? range(l[0], l[1]) : l;
  return toHex(hsla(_h, _s, _l, 1));
};
