// Adapted from lz-string 1.5.0's MIT-licensed decompressor.
// The original implementation is Copyright (c) 2013 Pieroxy.

const URI_SAFE_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";

type DecompressResult =
  | { ok: true; value: string }
  | { ok: false; reason: "invalid-input" }
  | {
      ok: false;
      reason: "output-too-large";
      outputLength: number;
    };

type BitReader = {
  value: number;
  position: number;
  index: number;
};

const readBits = (
  count: number,
  input: string,
  reader: BitReader,
): number | undefined => {
  let bits = 0;
  let power = 1;
  const maxPower = 2 ** count;

  while (power !== maxPower) {
    const bit = reader.value & reader.position;
    reader.position >>= 1;
    if (reader.position === 0) {
      reader.position = 32;
      if (reader.index >= input.length) return undefined;
      reader.value = URI_SAFE_ALPHABET.indexOf(input.charAt(reader.index++));
      if (reader.value < 0) return undefined;
    }
    bits |= (bit > 0 ? 1 : 0) * power;
    power <<= 1;
  }

  return bits;
};

export const decompressUriComponentBounded = (
  encoded: string,
  maxOutputLength: number,
): DecompressResult => {
  if (encoded.length === 0 || maxOutputLength < 0) {
    return { ok: false, reason: "invalid-input" };
  }

  const input = encoded.replace(/ /g, "+");
  const firstValue = URI_SAFE_ALPHABET.indexOf(input.charAt(0));
  if (firstValue < 0) return { ok: false, reason: "invalid-input" };

  const dictionary: string[] = [];
  let enlargeIn = 4;
  let dictionarySize = 4;
  let numberOfBits = 3;
  const reader: BitReader = {
    value: firstValue,
    position: 32,
    index: 1,
  };

  const firstToken = readBits(2, input, reader);
  let current: string;
  if (firstToken === 0) {
    const character = readBits(8, input, reader);
    if (character === undefined) return { ok: false, reason: "invalid-input" };
    current = String.fromCharCode(character);
  } else if (firstToken === 1) {
    const character = readBits(16, input, reader);
    if (character === undefined) return { ok: false, reason: "invalid-input" };
    current = String.fromCharCode(character);
  } else {
    return firstToken === 2
      ? { ok: true, value: "" }
      : { ok: false, reason: "invalid-input" };
  }

  if (current.length > maxOutputLength) {
    return { ok: false, reason: "output-too-large", outputLength: 0 };
  }

  dictionary[3] = current;
  let previous = current;
  const output = [current];
  let outputLength = current.length;

  while (true) {
    const token = readBits(numberOfBits, input, reader);
    if (token === undefined) return { ok: false, reason: "invalid-input" };

    let code = token;
    if (code === 0 || code === 1) {
      const character = readBits(code === 0 ? 8 : 16, input, reader);
      if (character === undefined) {
        return { ok: false, reason: "invalid-input" };
      }
      dictionary[dictionarySize++] = String.fromCharCode(character);
      code = dictionarySize - 1;
      enlargeIn -= 1;
    } else if (code === 2) {
      return { ok: true, value: output.join("") };
    }

    if (enlargeIn === 0) {
      enlargeIn = 2 ** numberOfBits;
      numberOfBits += 1;
    }

    let entry = dictionary[code];
    if (entry === undefined) {
      if (code !== dictionarySize) {
        return { ok: false, reason: "invalid-input" };
      }
      entry = previous + previous.charAt(0);
    }

    if (outputLength + entry.length > maxOutputLength) {
      return {
        ok: false,
        reason: "output-too-large",
        outputLength,
      };
    }
    output.push(entry);
    outputLength += entry.length;

    dictionary[dictionarySize++] = previous + entry.charAt(0);
    enlargeIn -= 1;
    previous = entry;

    if (enlargeIn === 0) {
      enlargeIn = 2 ** numberOfBits;
      numberOfBits += 1;
    }
  }
};
