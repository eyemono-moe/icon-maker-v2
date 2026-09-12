import type { ImageQueryOutput } from "./imageQuerySchema";
const optimizeSvgOnDemand = async (svgText: string) => {
  const { optimizeSvg } = await import("./svg-optimize");
  return optimizeSvg(svgText);
};

const imageDataString = async (svg: HTMLElement) => {
  const svgData = new XMLSerializer().serializeToString(svg);
  const optimized = await optimizeSvgOnDemand(svgData);
  return `data:image/svg+xml;base64,${btoa(optimized)}`;
};

const saveWithAnchor = (data: string, filename: string) => {
  const a = document.createElement("a");
  a.href = data;
  a.download = filename;
  a.dispatchEvent(new MouseEvent("click"));
};

type PngCanvas = {
  width: number;
  height: number;
  getContext: (contextId: "2d") => {
    drawImage: (image: CanvasImageSource, x: number, y: number) => void;
  } | null;
  toBlob: (callback: (blob: Blob | null) => void, type?: string) => void;
  toDataURL: (type?: string) => string;
};
type PngImage = {
  onload: ((event?: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  src: string;
  width: number;
  height: number;
};

export type PngPrimitives = {
  createCanvas: () => PngCanvas;
  createImage: () => PngImage;
  imageDataString: (svg: HTMLElement) => Promise<string>;
};

const browserPngPrimitives: PngPrimitives = {
  createCanvas: () => document.createElement("canvas"),
  createImage: () => new Image() as unknown as PngImage,
  imageDataString,
};

export const createPngCanvas = async (
  svg: HTMLElement,
  primitives: PngPrimitives = browserPngPrimitives,
) => {
  const canvas = primitives.createCanvas();
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas context unavailable");

  const image = primitives.createImage();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      try {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image as unknown as CanvasImageSource, 0, 0);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = (event) => {
      reject(
        event instanceof Error ? event : new Error("PNG image failed to load"),
      );
    };
    void primitives
      .imageDataString(svg)
      .then((dataUrl) => {
        image.src = dataUrl;
      })
      .catch(reject);
  });

  return canvas;
};

const createPngBlob = async (canvas: PngCanvas): Promise<Blob> =>
  new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG encoding failed"));
          return;
        }
        resolve(blob);
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });

export const downloadSvg = async (svg: HTMLElement, filename?: string) => {
  const downloadHref = await imageDataString(svg);
  saveWithAnchor(downloadHref, filename ?? "icon.svg");
};

export const downloadPng = async (svg: HTMLElement, filename?: string) => {
  const canvas = await createPngCanvas(svg);
  const downloadHref = canvas.toDataURL("image/png");
  saveWithAnchor(downloadHref, filename ?? "icon.png");
};

export const copySvg = async (svg: HTMLElement) => {
  const stringSvg = new XMLSerializer().serializeToString(svg);
  const optimized = await optimizeSvgOnDemand(stringSvg);
  return navigator.clipboard.writeText(optimized);
};

export const copyPng = async (svg: HTMLElement) => {
  const canvas = await createPngCanvas(svg);
  const blob = await createPngBlob(canvas);
  await navigator.clipboard.write([
    new globalThis.ClipboardItem({ [blob.type]: blob }),
  ]);
};

export const copyImageUrl = (
  format: Exclude<ImageQueryOutput["f"], undefined>,
) => {
  // 現在開いているURLのクエリパラメータはそのままに、パスを`/image`に変更する
  const url = new URL(window.location.href);
  url.pathname = "/image";
  url.searchParams.set("f", format);

  return navigator.clipboard.writeText(url.toString());
};
