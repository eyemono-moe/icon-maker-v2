import { type InitInput, Resvg, initWasm } from "@resvg/resvg-wasm";
import type { PngDimensions, PngEncoder } from "./png-encoder";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type: string, data: Uint8Array) => {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
};

const zlib = async (bytes: Uint8Array) =>
  new Uint8Array(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate")),
    ).arrayBuffer(),
  );

const encodeRgbaPng = async (
  pixels: Uint8Array,
  width: number,
  height: number,
) => {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace

  const stride = width * 4;
  const scanlines = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    // Filter byte 0 (None) precedes each row.
    scanlines.set(
      pixels.subarray(y * stride, (y + 1) * stride),
      y * (stride + 1) + 1,
    );
  }

  const parts = [
    Uint8Array.from(PNG_SIGNATURE),
    chunk("IHDR", header),
    chunk("IDAT", await zlib(scanlines)),
    chunk("IEND", new Uint8Array()),
  ];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
};

// Mirrors Sharp's `extend({ extendWith: "copy" })`: padding repeats edge pixels.
const extendWithEdgeCopy = (
  source: Uint8Array,
  size: number,
  width: number,
  height: number,
) => {
  const left = Math.floor((width - size) / 2);
  const top = Math.floor((height - size) / 2);
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(Math.max(y - top, 0), size - 1);
    for (let x = 0; x < width; x++) {
      const sx = Math.min(Math.max(x - left, 0), size - 1);
      const from = (sy * size + sx) * 4;
      out.set(source.subarray(from, from + 4), (y * width + x) * 4);
    }
  }
  return out;
};

export class WorkersPngEncoder implements PngEncoder {
  #ready: Promise<void> | undefined;

  constructor(private readonly loadWasm: () => Promise<InitInput>) {}

  async encode(svg: string, dimensions: PngDimensions): Promise<Uint8Array> {
    this.#ready ??= this.loadWasm().then(initWasm);
    await this.#ready;

    if (!dimensions.square) {
      return this.#render(svg, dimensions.w).asPng();
    }

    const size = Math.min(dimensions.w, dimensions.h);
    const image = this.#render(svg, size);
    if (dimensions.w === dimensions.h) return image.asPng();

    return encodeRgbaPng(
      extendWithEdgeCopy(image.pixels, size, dimensions.w, dimensions.h),
      dimensions.w,
      dimensions.h,
    );
  }

  #render(svg: string, width: number) {
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
    try {
      return resvg.render();
    } finally {
      resvg.free();
    }
  }
}
