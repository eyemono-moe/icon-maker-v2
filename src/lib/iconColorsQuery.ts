import pkg from "lz-string";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  pkg;

export const encodeIconColors = (colors: unknown): string =>
  compressToEncodedURIComponent(JSON.stringify(colors));

export const decodeIconColors = <T>(params: string): T =>
  JSON.parse(decompressFromEncodedURIComponent(params)) as T;
