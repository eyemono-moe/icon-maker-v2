import lzString from "lz-string";
import * as v from "valibot";
import { type IconState, iconStateSchema } from "./icon-state";
import { decompressUriComponentBounded } from "./lz-string-bounded";

export const MAX_ENCODED_ICON_STATE_LENGTH = 8_192;
export const MAX_ICON_STATE_JSON_LENGTH = 65_536;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type IconStateDecodeError =
  | { code: "input-too-large"; limit: number }
  | { code: "output-too-large"; limit: number }
  | { code: "invalid-json" }
  | { code: "invalid-schema"; issues: readonly string[] };

export const encodeIconState = (state: IconState): string =>
  lzString.compressToEncodedURIComponent(JSON.stringify(state));

export const decodeIconState = (
  input: string,
): Result<IconState, IconStateDecodeError> => {
  if (input.length > MAX_ENCODED_ICON_STATE_LENGTH) {
    return {
      ok: false,
      error: { code: "input-too-large", limit: MAX_ENCODED_ICON_STATE_LENGTH },
    };
  }

  const decompressed = decompressUriComponentBounded(
    input,
    MAX_ICON_STATE_JSON_LENGTH,
  );
  if (!decompressed.ok && decompressed.reason === "output-too-large") {
    return {
      ok: false,
      error: { code: "output-too-large", limit: MAX_ICON_STATE_JSON_LENGTH },
    };
  }
  if (!decompressed.ok) {
    return { ok: false, error: { code: "invalid-json" } };
  }

  let value: unknown;
  try {
    value = JSON.parse(decompressed.value);
  } catch {
    return { ok: false, error: { code: "invalid-json" } };
  }

  const result = v.safeParse(iconStateSchema, value);
  if (!result.success) {
    return {
      ok: false,
      error: {
        code: "invalid-schema",
        issues: result.issues.map((issue) => issue.message),
      },
    };
  }

  return { ok: true, value: result.output };
};
