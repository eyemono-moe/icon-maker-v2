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

export const downloadSvg = async (svg: HTMLElement, filename?: string) => {
  const downloadHref = await imageDataString(svg);
  saveWithAnchor(downloadHref, filename ?? "icon.svg");
};

export const downloadPng = async (svg: HTMLElement, filename?: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);

    const downloadHref = canvas.toDataURL("image/png");
    saveWithAnchor(downloadHref, filename ?? "icon.png");
  };
  img.src = await imageDataString(svg);
};

export const copySvg = async (svg: HTMLElement) => {
  const stringSvg = new XMLSerializer().serializeToString(svg);
  const optimized = await optimizeSvgOnDemand(stringSvg);
  return navigator.clipboard.writeText(optimized);
};

export const copyPng = async (svg: HTMLElement) => {
  return new Promise<void>((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        // todo: add toast
        resolve(
          navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]),
        );
      }, "image/png");
    };
    void imageDataString(svg).then((dataUrl) => {
      img.src = dataUrl;
    });
  });
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
