import { afterEach, describe, expect, test, vi } from "vitest";
import { copyPng, createPngCanvas, downloadPng } from "./saveImage";

vi.mock("./svg-optimize", () => ({
  optimizeSvg: (svg: string) => svg,
}));

type FakeImage = {
  onload: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  width: number;
  height: number;
  src: string;
};

const svg = {} as HTMLElement;

const installBrowserPrimitives = (options: {
  imageAction: (image: FakeImage) => void;
  toBlob?: (callback: (blob: Blob | null) => void) => void;
  write?: () => Promise<void>;
  drawImage?: () => void;
}) => {
  const drawImage = vi.fn();
  if (options.drawImage) drawImage.mockImplementation(options.drawImage);
  const toDataURL = vi.fn(() => "data:image/png;base64,encoded");
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toBlob: options.toBlob ?? ((callback) => callback(new Blob(["png"]))),
    toDataURL,
  };
  const dispatchEvent = vi.fn();
  vi.stubGlobal("document", {
    createElement: (tag: string) =>
      tag === "canvas" ? canvas : { href: "", download: "", dispatchEvent },
  });
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      width = 32;
      height = 32;
      set src(_value: string) {
        options.imageAction(this);
      }
    },
  );
  vi.stubGlobal(
    "XMLSerializer",
    class {
      serializeToString() {
        return "<svg />";
      }
    },
  );
  vi.stubGlobal("btoa", () => "encoded");
  vi.stubGlobal("MouseEvent", class {});
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      clipboard: { write: options.write ?? (() => Promise.resolve()) },
    },
  });
  vi.stubGlobal(
    "ClipboardItem",
    class {
      constructor(public readonly items: Record<string, Blob>) {}
    },
  );
  return { canvas, dispatchEvent, drawImage, toDataURL };
};

afterEach(() => vi.unstubAllGlobals());

describe("copyPng", () => {
  test("rejects when image loading fails", async () => {
    installBrowserPrimitives({
      imageAction: (image) => image.onerror?.(new Error("image failed")),
    });

    await expect(copyPng(svg)).rejects.toThrow("image failed");
  });

  test("rejects when canvas encoding returns no blob", async () => {
    installBrowserPrimitives({
      imageAction: (image) => image.onload?.(),
      toBlob: (callback) => callback(null),
    });

    await expect(copyPng(svg)).rejects.toThrow("PNG encoding failed");
  });

  test("rejects when a rendering callback throws", async () => {
    installBrowserPrimitives({
      imageAction: (image) => image.onload?.(),
      drawImage: () => {
        throw new Error("draw failed");
      },
    });

    await expect(copyPng(svg)).rejects.toThrow("draw failed");
  });

  test("propagates clipboard rejection", async () => {
    installBrowserPrimitives({
      imageAction: (image) => image.onload?.(),
      write: () => Promise.reject(new Error("clipboard failed")),
    });

    await expect(copyPng(svg)).rejects.toThrow("clipboard failed");
  });

  test("waits for clipboard completion", async () => {
    let resolveClipboard!: () => void;
    const write = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveClipboard = resolve;
        }),
    );
    installBrowserPrimitives({
      imageAction: (image) => image.onload?.(),
      write,
    });

    let settled = false;
    const copy = copyPng(svg).then(() => {
      settled = true;
    });
    await vi.waitFor(() => expect(write).toHaveBeenCalledOnce());
    expect(settled).toBe(false);

    resolveClipboard();
    await copy;
    expect(settled).toBe(true);
  });
});

test("propagates lazy optimizer rejection before creating an image", async () => {
  const image: FakeImage = {
    onload: null,
    onerror: null,
    width: 1,
    height: 1,
    src: "",
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toBlob: () => {},
    toDataURL: () => "",
  };

  await expect(
    createPngCanvas(svg, {
      createCanvas: () => canvas,
      createImage: () => image,
      imageDataString: async () => {
        throw new Error("optimizer failed");
      },
    }),
  ).rejects.toThrow("optimizer failed");
});

test("downloadPng resolves only after the download is dispatched", async () => {
  let resolveImage!: () => void;
  const { dispatchEvent } = installBrowserPrimitives({
    imageAction: (image) => {
      resolveImage = () => {
        image.onload?.();
      };
    },
  });

  const download = downloadPng(svg);
  await Promise.resolve();
  await vi.waitFor(() => expect(resolveImage).toBeTypeOf("function"));
  expect(dispatchEvent).not.toHaveBeenCalled();

  resolveImage();
  await download;
  expect(dispatchEvent).toHaveBeenCalledOnce();
});
